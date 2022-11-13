Vue.component('modal-article-chooser', { 
    mixins: [utilMixins],
    template:`
    <div class="modal" ref="modal">
        <div class="modal-background"></div>
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title">Artikel hinzufügen</p>
                <button class="delete" aria-label="close" @click="vibrate();cancel();"></button>
            </header>
            <section class="modal-card-body" v-if="render">
                <search v-model="search" @changed="filter" />
                <div v-if="!search || search.length == 0" style="border-bottom: solid 1px #DFDFDF;margin-bottom:1em">
                    <pilltab v-model="tab" id="top" title="TOP" icon="fa-trophy"/>
                    <pilltab v-model="tab" id="all" title="Alle"/>
                    <pilltab v-model="tab" id="favorites" title="Favoriten" icon="fa-heart"/>
                    <pilltab v-model="tab" v-for="at in articleTypes" :id="at.id" :title="at.shortTitle" :icon="at.icon"/>
                </div>
                <sale-article-line v-for="article in articles" :article="article" :sale="sale" :key="article.id" @modify="(article,amount)=>modify(article,amount)"/>
            </section>
            <footer class="modal-card-foot">
                <button-cancel @click="vibrate();cancel();"/>
                <div class="control" style="flex-grow: 1">&nbsp;</div>
                <button-success-inverted @click="vibrate();pay();" v-if="modifications && modifications.length>0">Zahlen</button-success-inverted>
                <button-primary-inverted @click="vibrate();addCredit();" v-if="!person.isBar && firstOnNewSale">Nur Guthaben kaufen</button-primary-inverted>
                <button-primary @click="vibrate();ok();">OK</button-primary>
            </footer>
        </div>
    </div>
    `,
    props: {
    },
    data() {
        return {
            search: "",
            resolve: null,
            reject: null,
            articleTypes: Article.getTypes(),
            tab: storage.get("user").useTop == 1 ? "top" : "all",
            rawarticles: [],
            articles: [],
            modifications: [],
            render: true,
            sale: {},
            person: {},
            firstOnNewSale: false,
            useTop: storage.get("user").useTop == 1
        };
    },
    watch: {
        tab() {
            this.filter();
        }
    },
    methods: {
        open(sale, person, firstOnNewSale) {
            var app = this;
            app.firstOnNewSale = firstOnNewSale;
            app.sale = sale;
            app.person = person;

            app.load(); 

            app.modifications = [];
            if(app.sale.articles && app.sale.articles.forEach) {
                app.sale.articles.forEach(sa => {
                    app.modifications.push({
                        id: sa.id,
                        article: sa.article,
                        amount: sa.amount
                    });
                });
            }

            console.log("open chooser", app.modifications);
            app.render=false;
            app.$nextTick(()=>app.render=true);

            return new Promise((resolve, reject) => {
                app.resolve = resolve;
                app.reject = reject;
            });
        },
        load() {
            var app = this;
            Article.getList({ personId: app.person.id }).then(articles => {
                app.rawarticles = articles;
                app.filter(true);
                $(app.$refs.modal).addClass("is-active");
            });  
        },
        filter(firstAfterLoad) {
            var app = this;
            app.articles = Article.getFiltered(app.rawarticles, { search: app.search, tab: app.tab, person: app.person });
            if(firstAfterLoad && app.articles.length == 0)  {
                app.tab = "all";
                app.render=false;
                app.$nextTick(()=>{app.render=true; app.filter();});
            }
        },
        modify(article,amount) {
            var app = this;
            if(app.modifications.find(m => m.article.id === article.id)) 
                app.modifications.find(m => m.article.id === article.id).amount = amount;
            else 
                app.modifications.push({
                    id: "_",
                    article: article,
                    amount: amount
                });
        },
        ok() {
            var app = this;
            $(app.$refs.modal).removeClass("is-active");
            console.log("article chooser modifications", app.modifications);
            app.resolve({ modifications: app.modifications });
        },
        cancel() {
            var app = this;
            $(app.$refs.modal).removeClass("is-active");
            app.reject();
        },
        addCredit() {
            var app = this;
            $(app.$refs.modal).removeClass("is-active");
            app.reject("addCredit");
        },
        createArticle() {
            var app = this;
            router.push({ path: '/article/_', query: { title: app.search, fs: true } });
        },
        pay() {
            var app = this;
            $(app.$refs.modal).removeClass("is-active");
            console.log("article chooser modifications", app.modifications);
            app.resolve({ modifications: app.modifications, params: { pay: true } });
        }
    }
 });