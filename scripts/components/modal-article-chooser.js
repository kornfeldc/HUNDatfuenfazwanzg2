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
                <div class="tabs" v-if="!search || search.length == 0">
                    <ul>
                        <li v-if="useTop" :class="(tab == 'top' ? 'is-active':'')"><a @click="vibrate();tab = 'top';">TOP</a></li>
                        <li :class="(tab == 'all' ? 'is-active':'')"><a @click="vibrate();tab = 'all';">Alle</a></li>
                        <li :class="(tab == 'favorites' ? 'is-active':'')"><a @click="vibrate();tab = 'favorites';">Favoriten</a></li>
                        <li v-for="at in articleTypes" :class="(tab == at.id ? 'is-active':'')"><a @click="vibrate();tab = at.id;">{{at.shortTitle}}</a></li>
                    </ul>
                </div>
                <sale-article-line v-for="article in articles" :article="article" :sale="sale" :key="article.id" @modify="(article,amount)=>modify(article,amount)"/>

                <!--
                <div v-if="search" class="columns is-mobile is-vcentered hover" @click="vibrate();createArticle();">
                    <div class="column">
                        <i style='min-width:30px;text-align:center' :class="'fa fa-plus f180 has-text-link' "  />
                    </div>
                    <div class="column is-full">
                        <h4 class="title is-5">"{{search}}" neu anlegen</h4>
                    </div>
                </div>
                -->

            </section>
            <footer class="modal-card-foot">
                <button-primary @click="vibrate();ok();">OK</button-primary>
                <button-primary-inverted @click="vibrate();addCredit();" v-if="!person.isBar && firstOnNewSale">Nur Guthaben kaufen</button-primary-inverted>
                <button-cancel @click="vibrate();cancel();"/>
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
            app.resolve(app.modifications);
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
    }
 });