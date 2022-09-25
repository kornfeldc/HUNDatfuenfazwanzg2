Vue.component('pilltab', { 
    mixins: [utilMixins],
    template: `
        <span :class="'tag customtag is-medium ' + (value===id?'is-link':'') ">
            <i v-if="icon" :class="'fa '+icon" style="padding-right:0.4em"/>
            <a @click="click()">{{title}}</a>
        </span>
    `,
    props: {
        value: { type: String, default: null },
        id: { type: String, default: "" },
        title: { type: String, default: "" },
        icon: { type: String, default: ""}
    },
    methods: {
        click() {
            var app = this;
            app.vibrate();
            app.$emit("input", app.id);
        }
    }
});