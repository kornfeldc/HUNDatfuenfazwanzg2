Vue.component('modal-yesno', { 
    mixins: [utilMixins],
    template:`
    <div class="modal" ref="modal">
        <div class="modal-background"></div>
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title">{{title}}</p>
                <button class="delete" aria-label="close" @click="vibrate();no();"></button>
            </header>
            <section class="modal-card-body" v-if="render">
                {{text}}
            </section>
            <footer class="modal-card-foot">
                <button-primary @click="vibrate();yes();">Ja</button-primary>
                <button-text @click="vibrate();no();">Nein</button-text>
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
        yes() {
            var app = this;
            $(app.$refs.modal).removeClass("is-active");
            app.resolve();
        },
        no() {
            var app = this;
            $(app.$refs.modal).removeClass("is-active");
            app.reject();
        }
    }
 });
