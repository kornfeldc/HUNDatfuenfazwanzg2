Vue.component('search', { 
    mixins: [utilMixins],
    template:`
    <div class="field has-addons pb-std">
        <div class="control has-icons-left" style="width:100%">
            <input class="input" type="text" v-model="val" placeholder="Suche"/>
            <span class="icon is-small is-left">
                <i class="fas fa-search"></i>
            </span>
        </div>
        <div class="control" v-if="val && val.length > 0">
            <a class="button is-outlined is-danger" @click="vibrate();clear();">
                <i class="fas fa-times"></i>
            </a>
        </div>
    </div>
    `,
    props: {
        value: { type: String }
    },
    data() {
        return {
            val: this.value
        };
    },
    watch: {
        val() {
            var app = this;
            console.log("emit "+app.val);
            app.$emit("input", app.val);
            app.$emit("changed");
        }
    },
    methods: {
        clear() {
            var app = this;
            app.$emit("input", "");
            app.$emit("changed");
        }
    }
 });