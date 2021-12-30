<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
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
        </v-card-text>
        <v-card-text>
          <v-textarea
            label="Encrypted"
            ref="encrypted2"
            v-model="encrypted2"
            outlined
            dense
            @click="clickEncrypted"
          ></v-textarea>
        </v-card-text>
        <v-card-text>
          <a :href="'?q=' + encrypted">link</a>
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
    };
  },
  computed: {
    data2: {
      get() {
        return this.data;
      },
      set(value) {
        this.data = value;
        this.encrypted = common.encrypt(this.data, this.$cookies);
      },
    },
    encrypted2: {
      get() {
        return this.encrypted;
      },
      set(value) {
        this.encrypted = value;
        this.data = common.decrypt(value, this.$cookies);
      }
    },
  },
  methods: {
    clickData() {
      this.$refs.data2.$el.querySelector("textarea").select();
    },
    clickEncrypted() {
      this.$refs.encrypted2.$el.querySelector("textarea").select();
    },
  },
  created() {
    let q = this.$route.query.q;
    if (q == undefined) {
      q = "";
    }
    this.encrypted = q;
    this.data = common.decrypt(q, this.$cookies);
  },
}
</script>
