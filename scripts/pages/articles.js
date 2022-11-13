const ArticlesPage = {
    mixins: [sessionMixin,utilMixins],
    template: `
    <page-container ref="page" :syncing="syncing">
        <div class="above_actions">
            <search v-model="search" @changed="filter" ref="search" />
            <!--<div class="tabs" v-if="!search || search.length == 0">
                <ul>
                    <li :class="(tab == 'favorites' ? 'is-active':'')"><a @click="vibrate();tab = 'favorites';">Favoriten</a></li>
                    <li v-for="at in articleTypes" :class="(tab == at.id ? 'is-active':'')"><a @click="vibrate();tab = at.id;">{{at.shortTitle}}</a></li>
                    <li :class="(tab == 'inactive' ? 'is-active':'')"><a @click="vibrate();tab = 'inactive';">Inaktiv</a></li>
                </ul>
            </div>
            -->

            <div v-if="!search || search.length == 0" style="border-bottom: solid 1px #DFDFDF;margin-bottom:1em">
                <pilltab v-model="tab" id="favorites" title="Favoriten" icon="fa-heart"/>
                <pilltab v-model="tab" v-for="at in articleTypes" :id="at.id" :title="at.shortTitle" :icon="at.icon"/>
                <pilltab v-model="tab" id="inactive" title="Inaktiv" icon="fa-ban"/>
            </div>

            <article-line v-for="entry in articles" :article="entry" v-on:click="vibrate();open(entry);" :key="entry.id"/>
        </div>
        <div class="actions">
            <div class="field" style="width:100%">
                <div class="control" style="flex-grow: 1">&nbsp;</div>
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
                app.restore();
                app.filter();
            });
        },
        filter() {
            var app = this;
            app.articles = Article.getFiltered(app.rawarticles, {tab: app.tab, search: app.search });
            if(app.scrollTop) {
                app.$nextTick(() => {
                    $(window).scrollTop(app.scrollTop);
                    delete app.scrollTop;
                });
            }
        },
        open(entry) {
            var app = this;
            app.$root.storedAA = { tab: app.tab, search: app.search, scrollTop: $(window).scrollTop() };
            router.push({ path: '/article/'+ (entry && entry.id ? entry.id : '_') });
        },
        restore() {
            var app = this;
            if(app.$root.storedAA) {
                app.tab = app.$root.storedAA.tab;
                app.search = app.$root.storedAA.search;
                app.$refs.search.set(app.search);
                app.scrollTop = app.$root.storedAA.scrollTop;
                delete app.$root.storedAA;
                return true;
            }
            else
                return false;
        }
    }
}