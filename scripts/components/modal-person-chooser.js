Vue.component('modal-person-chooser', { 
    mixins: [utilMixins],
    template:`
    <div class="modal" ref="modal">
        <div class="modal-background"></div>
        <div class="modal-card">
        <header class="modal-card-head">
            <p class="modal-card-title">Person auswählen</p>
            <button class="delete" aria-label="close" @click="vibrate();cancel();"></button>
        </header>
        <section class="modal-card-body">
            <search v-model="search" @changed="filter" />
            <!--<div class="tabs" v-if="!search || search.length == 0">
                <ul>
                    <li v-for="t in types" v-if="t.id !== 'top' || useTop" :class="(tab == t.id ? 'is-active':'')"><a @click="vibrate();tab = t.id;">{{t.shortTitle}}</a></li>
                </ul>
            </div>-->
            <div v-if="!search || search.length == 0" style="border-bottom: solid 1px #DFDFDF;margin-bottom:1em">
                <pilltab v-model="tab" v-for="t in types" :id="t.id" :title="t.shortTitle" :icon="t.icon"/>
            </div>
            
            <v-touch v-on:swipeleft="onSwipe(1,$event)" v-on:swiperight="onSwipe(-1,$event)">

                <person-line :person="barPerson" v-on:click="choose(barPerson)"/>
                <person-line v-for="entry in persons" :person="entry" v-on:click="choose(entry)" :key="entry.id" mode="chooser"/>

                <div v-if="search" class="columns is-mobile is-vcentered hover" @click="vibrate();createPerson();">
                    <div class="column">
                        <i style='min-width:30px;text-align:center' :class="'fa fa-plus f180 has-text-link' "  />
                    </div>
                    <div class="column is-full">
                        <h4 class="title is-5">"{{search}}" neu anlegen</h4>
                    </div>
                </div>
            </v-touch>

        </section>
        </div>
    </div>
    `,
    props: {
    },
    data() {
        return {
            barPerson: barPerson,
            search: "",
            types: [
                { id: "top", shortTitle: "TOP", icon: "fa-trophy" },
                { id: "all", shortTitle: "Alle" },
                { id: "member", shortTitle: "Mitglieder", icon: "fa-star" },
                { id: "nomember", shortTitle: "Andere" }
            ],
            tab: storage.get("user").useTop == 1 ? "top" : "all",
            resolve: null,
            reject: null,
            rawpersons: [],
            persons: [],
            useTop: storage.get("user").useTop == 1
        };
    },
    watch: {
        tab() {
            this.filter();
        }
    },
    methods: {
        open() {
            var app = this;
            app.load();
            
            return new Promise((resolve, reject) => {
                app.resolve = resolve;
                app.reject = reject;
            });
        },
        load() {
            var app = this;
            Person.getList().then(persons => {
                app.rawpersons = persons;      
                app.filter(true);
                $(app.$refs.modal).addClass("is-active");
            });   
        },
        filter(firstAfterLoad) {
            var app = this;
            app.persons = Person.getFiltered(app.rawpersons, { search: app.search, tab: app.tab, chooser: true });
            if(firstAfterLoad && app.persons.length == 0)  {
                app.tab = "all";
                app.render=false;
                app.$nextTick(()=>{app.render=true; app.filter();});
            }
        },
        cancel() {
            var app = this;
            $(app.$refs.modal).removeClass("is-active");
            app.reject();
        },
        choose(person) {
            var app = this;
            if(person && person.mainPersonId && person.mainPersonId.length > 0) {
                Person.get(person.mainPersonId).then(mainPerson => {
                    $(app.$refs.modal).removeClass("is-active");
                    app.resolve(mainPerson);
                });
            }
            else {
                $(app.$refs.modal).removeClass("is-active");
                app.resolve(person);
            }
        },
        createPerson() {
            var app = this;
            router.push({ path: '/person/_', query: { name: app.search, fs: true } });
        },
        onSwipe(dir,evt) {
            var app = this;
            evt.srcEvent.stopPropagation();
            evt.srcEvent.preventDefault();
            return false;
        }
    }
 });