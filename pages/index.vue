<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="12" md="12">
      <v-card>
        <v-card-text>
          <v-textarea
            label="Data"
            ref="data2"
            v-model="data2"
            outlined
            dense
            @click="clickData"
          ></v-textarea>
          <template v-if="encrypted != new_encrypted">
            <v-textarea
              label="Encrypted"
              ref="encrypted2"
              v-model="encrypted2"
              outlined
              dense
              @click="clickEncrypted"
            ></v-textarea>
            <a :href="encrypted_link">link</a>
          </template>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" sm="12" md="12">
      <v-card>
        <v-card-text>
          <v-text-field v-model="master_password_0" label="Old Master Password" type="password"></v-text-field>
          <v-text-field v-model="master_password_1" label="New Master Password" type="password"></v-text-field>
          <v-text-field v-model="master_password_2" label="New Master Password (Confirm)" type="password"></v-text-field>
          <v-btn
            elevation="2"
            @click="clickRotate"
          >Rotate</v-btn>
          <v-alert
            dense
            outlined
            type="error"
            v-if="errorMessage"
          >{{errorMessage}}</v-alert>
          <v-textarea
            label="Data Key Encrypted"
            ref="data_key_encrypted"
            v-model="data_key_encrypted"
            outlined
            dense
            @click="clickDataKeyEncrypted"
          ></v-textarea>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import common from '@/plugins/common'

export default {
  data() {
    return {
      data: "",
      encrypted: "",
      new_encrypted: "",
      rotate_counter: 0,
      master_password_0: "",
      master_password_1: "",
      master_password_2: "",
      errorMessage: "",
    };
  },
  computed: {
    data2: {
      get() {
        return this.data;
      },
      set(value) {
        this.data = value;
        this.new_encrypted = common.encrypt(this.data, this.$cookies);
      },
    },
    encrypted2: {
      get() {
        return this.new_encrypted;
      },
      set(value) {
        this.new_encrypted = value;
        [_, this.data] = common.decrypt(value, this.$cookies);
      },
    },
    encrypted_link: {
      get() {
        if (this.new_encrypted.length > 1800) {
          return "./";
        } else {
          return "./?q=" + this.new_encrypted;
        }
      },
    },
    data_key_encrypted: {
      get() {
        this.rotate_counter; // rotate_counterがカウントアップされるたびに再描画されるようにするためのコード
        const data_key_encrypted = this.$cookies.get("data_key_encrypted");
        if (data_key_encrypted == undefined)
          return "";
        return data_key_encrypted;
      },
      set(value) {
        this.$cookies.set("data_key_encrypted", value)
      },
    },
  },
  methods: {
    clickData() {
      this.$refs.data2.$el.querySelector("textarea").select();
    },
    clickEncrypted() {
      this.$refs.encrypted2.$el.querySelector("textarea").select();
    },
    clickDataKeyEncrypted() {
      this.$refs.data_key_encrypted.$el.querySelector("textarea").select();
    },
    clickRotate() {
      if (this.master_password_1 != this.master_password_2) {
        this.errorMessage = "New passwords do not match";
        return;
      }
      if (this.master_password_1 == "") {
        console.log("Empty new password");
        return;
      }
      this.errorMessage = "";
      common.rotateDataKey(this.master_password_0, this.master_password_1, this.$cookies, (errorMessage) => {
        this.errorMessage = errorMessage;
      });
      if (this.errorMessage == "") {
        this.master_password_0 = "";
        this.master_password_1 = "";
        this.master_password_2 = "";
        this.rotate_counter++;
        [this.new_encrypted, this.data] = common.decrypt(this.new_encrypted, this.$cookies);
      }
    },
  },
  created() {
    let q = this.$route.query.q;
    if (q == undefined) {
      q = "";
    }
    this.encrypted = q;
    [this.new_encrypted, this.data] = common.decrypt(q, this.$cookies);
  },
}
</script>
