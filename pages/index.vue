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
            <v-btn :to="encrypted_link"><v-icon>mdi-link-variant</v-icon></v-btn>
          </template>
        </v-card-text>
        <v-card-text>
          <v-btn
            elevation="2"
            @click="generate_random"
          >Generate random</v-btn>
        </v-card-text>
        <template v-if="!view_admin">
          <v-card-text>
            <v-btn
              elevation="2"
              @click="view_admin=true"
            ><v-icon>mdi-cog</v-icon></v-btn>
          </v-card-text>
        </template>
        <template v-if="view_admin">
          <v-card-text>
            <v-text-field v-model="master_password" label="Current Master Password" type="password"></v-text-field>
            <v-text-field v-model="master_password_1" label="New Master Password" type="password"></v-text-field>
            <v-text-field v-model="master_password_2" label="New Master Password (Confirm)" type="password"></v-text-field>
            <v-btn
              elevation="2"
              @click="clickRotate"
            >Rotate</v-btn>
          </v-card-text>
          <v-card-text v-if="errorMessage">
            <v-alert
              dense
              outlined
              type="error"
            >{{errorMessage}}</v-alert>
          </v-card-text>
          <v-card-text>
            <v-textarea
              label="Data Key Encrypted"
              ref="data_key_encrypted"
              v-model="data_key_encrypted"
              outlined
              dense
              @click="clickDataKeyEncrypted"
            ></v-textarea>
          </v-card-text>
        </template>
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
      view_admin: false,
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
        const [enc, data] = common.decrypt(value, this.$cookies);
        this.data = data;
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
    master_password: {
      get() {
        return this.master_password_0;
      },
      set(value) {
        this.master_password_0 = value;
        common.setMasterPassword(value, this.$cookies);
        this.refresh();
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
        if (value == this.$cookies.get("data_key_encrypted")) {
          return
        }
        this.$cookies.set("data_key_encrypted", value, {maxAge: 30 * 86400});
        if (this.master_password_0 != "") {
      console.log("setMasterPassword");
          common.setMasterPassword(this.master_password_0, this.$cookies);
        }
        this.refresh();
        /*
        if (value == "") {
          if (this.data == "") {
            // nothing
          } else {
            this.new_encrypted = "";
          }
        } else {
          if (this.data == "") {
            const [enc, data] = common.decrypt(this.encrypted, this.$cookies);
            this.data = data;
          } else {
            this.new_encrypted = common.encrypt(this.data, this.$cookies);
          }
        }
        */
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
    generate_random() {
      const random_data = common.generatePassword(10);
      this.data = random_data;
      this.new_encrypted = common.encrypt(this.data, this.$cookies);
    },
    refresh() {
      console.log("refresh");
      if (this.data == "") {
        const [enc, data] = common.decrypt(this.encrypted, this.$cookies);
        this.data = data;
      } else {
        this.new_encrypted = common.encrypt(this.data, this.$cookies);
      }
    },
    clickRotate() {
      if (this.master_password_1 != this.master_password_2) {
        this.errorMessage = "New passwords do not match";
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
    common.refreshCookie(this.$cookies);
  },
}
</script>
