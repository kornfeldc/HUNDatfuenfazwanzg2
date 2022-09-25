Vue.component('modal-input-date', { 
    mixins: [utilMixins],
    template:`
    <div class="modal" ref="modal">
        <div class="modal-background"></div>
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title">{{title}}</p>
                <button class="delete" aria-label="close" @click="vibrate();cancel();"></button>
            </header>
            <section class="modal-card-body" v-if="render">
                <input class="input" type="date" ref="inp" v-model:value="value" @keyup.enter="save"/>
            </section>
            <footer class="modal-card-foot">
                <button-primary @click="vibrate();save();">OK</button-primary>
                <button-cancel @click="vibrate();cancel();"/>
            </footer>
        </div>
    </div>
    `,
    data() {
        return {
            title: "",
            value: "",
            render: true,
            resolve: null,
            reject: null
        };
    },
    methods: {
        open(value, title) {
            var app = this;
            app.value = value;
            app.title = title;

            $(app.$refs.modal).addClass("is-active");

            wait().then(() => { 
                $(app.$refs.inp).focus();
                wait().then($(app.$refs.inp).select());
            });

            return new Promise((resolve, reject) => {
                app.resolve = resolve;
                app.reject = reject;
            });
        },
        save() {
            var app = this;
            $(app.$refs.modal).removeClass("is-active");
            app.resolve(app.value);
        },
        cancel() {
            var app = this;
            $(app.$refs.modal).removeClass("is-active");
            app.reject();
        }
    }
 });
