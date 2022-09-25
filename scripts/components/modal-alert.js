Vue.component('modal-alert', { 
    mixins: [utilMixins],
    template:`
    <div class="modal" ref="modal">
        <div class="modal-background"></div>
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title">{{title}}</p>
                <button class="delete" aria-label="close" @click="vibrate();ok();"></button>
            </header>
            <section class="modal-card-body" v-if="render">
                {{text}}
            </section>
            <footer class="modal-card-foot">
                <button-primary @click="vibrate();ok();">OK</button-primary>
            </footer>
        </div>
    </div>
    `,
    props: {
        title: { type: String },
        text: { type: String }
    },
    data() {
        return {
            render: true,
            resolve: null,
            reject: null
        };
    },
    methods: {
        open() {
            var app = this;
            $(app.$refs.modal).addClass("is-active");
            return new Promise((resolve, reject) => {
                app.resolve = resolve;
                app.reject = reject;
            });
        },
        ok() {
            var app = this;
            $(app.$refs.modal).removeClass("is-active");
            app.resolve();
        }
    }
 });
