const ArticlesPage = {
    mixins: [sessionMixin,utilMixins],
    template: `
    <page-container ref="page" :syncing="syncing">
        <div class="above_actions">
            <search v-model="search" @changed="filter" />
            <div class="tabs" v-if="!search || search.length == 0">
                <ul>
                    <li :class="(tab == 'favorites' ? 'is-active':'')"><a @click="vibrate();tab = 'favorites';">Favoriten</a></li>
                    <li v-for="at in articleTypes" :class="(tab == at.id ? 'is-active':'')"><a @click="vibrate();tab = at.id;">{{at.shortTitle}}</a></li>
                </ul>
            </div>
            <article-line v-for="entry in articles" :article="entry" v-on:click="vibrate();open(entry);" :key="entry.id"/>
        </div>
        <div class="actions">
            <div class="field">
                <div class="control">
                    <button-primary @click="vibrate();open();">Neuer Artikel</button-primary>
                </div>
            </div>
        </div>
    </page-container>
    `,
    data() {
        return {
            search: "",
            articleTypes: Article.getTypes(),
            tab: "favorites",
            rawarticles: [],
            articles: [],
            isMainPage: true,
            first: true
        };
    },
    watch: {
        tab() {
            this.filter();
        }
    },
    methods: {
        initDone() {
            var app = this;
            app.load();
        },
        load() {
            var app = this;
            if(app.first) app.syncing=true;
            Article.getList().then(articles => {
                app.first = false;
                app.syncing = false;
                app.rawarticles = articles;    
                app.filter();
            });
        },
        filter() {
            var app = this;
            app.articles = Article.getFiltered(app.rawarticles, {tab: app.tab, search: app.search });
        },
        open(entry) {
            router.push({ path: '/article/'+ (entry && entry.id ? entry.id : '_') });
        }
    }
}