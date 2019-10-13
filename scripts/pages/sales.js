const SalesPage = {
    mixins: [sessionMixin,utilMixins],
    template: `
    <page-container :syncing="syncing">
        <div class="above_actions">
            <div class="px-std columns is-mobile is-vcentered">
                <div class="column is-full is-centered" style="text-align:center">
                    <button class="button is-link is-rounded is-outlined" @click="vibrate();chooseDay();">{{dayText}}</button>
                </div>
            </div>
            <template v-for="entry in sales">
                <div class="px-std columns is-mobile is-vcentered" v-if="entry.isFirstUnpayed">
                    <div class="column">
                        <p class="title is-5 warning-text">Offen</p>
                    </div>
                    <div class="column is-narrow title">
                        <p class="title is-5 warning-text">{{format(sumUnpayed)}}</p>
                    </div>
                </div>
                <div class="px-std columns is-mobile is-vcentered" v-if="entry.isFirstPayed">
                    <div class="column">
                        <p class="title is-5 has-text-success">Bezahlt</p>
                    </div>
                    <div class="column is-narrow title">
                        <p class="title is-5 has-text-success">{{format(sumPayed)}}</p>
                    </div>
                </div>
                <sale-line  :sale="entry" v-on:click="vibrate();open(entry)" :key="entry.id"/>
            </template>

            <div v-if="sales.length === 0" class="px-std columns is-mobile is-vcentered">
                <div class="column is-full is-centered" style="text-align:center">
                    <div class="title is-4">&nbsp;</div>
                    <div class="title is-4">&nbsp;</div>
                    <div class="title is-4">
                        Es gibt noch keine Verkäufe
                    </div>
                    <div>
                        <button class="button is-link is-large" @click="vibrate();open();">Jetzt neuen Verkauf anlegen</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="actions" v-show="isToday && sales.length > 0">
            <div class="field is-grouped">
                <div class="control">
                    <button-primary @click="vibrate();open();">Neuer Verkauf</button-primary>
                </div>
            </div>
        </div>
        <modal-day-chooser ref="dayChooser" @syncStart="syncing=true" @syncStop="syncing=false" />
    </page-container>
    `,
    data() {
        return {
            day: moment().format(util.dateFormat),
            rawsales: [],
            sales: [],
            isMainPage: true
        };
    },
    computed: {
        isToday() {
            return this.day === moment().format(util.dateFormat);
        },
        dayText() {
            return moment(this.day,util.dateFormat).format("dddd, DD.MM.YYYY");
        },
        sumUnpayed() {
            var app = this;
            var sum = 0;
            app.sales.filter(s => !s.isPayed).forEach(s => sum += parseFloat(s.articleSum));
            return sum;
        },
        sumPayed() {
            var app = this;
            var sum = 0;
            app.sales.filter(s => s.isPayed).forEach(s => sum += parseFloat(s.articleSum));
            return sum;
        }
    },
    created() {
        console.log("created");
    },
    methods: {
        initDone() {
            var app = this;
            
            app.restore();
            app.load();

            // $(document).on("dbChanged", (evt,options) => {
            //     if(options.db === "actSales") {
            //         console.log("reload sales after dbChange");
            //         app.load();
            //     }
            // });
        },
        load() {
            var app = this;
            console.log("start load sales");
            app.syncing=true;            
            Sale.getList({ day: app.day, loadArticles: true }).then(sales => {
                app.rawsales = sales;      
                app.filter();
                app.syncing=false;
            }).catch((err) => console.log("error on getting sales", err));
        },
        filter() {
            var app = this;
            app.sales = Sale.getFiltered(app.rawsales, {});
        },
        open(entry) {
            var app = this;
            app.$root.storedSalesOptions = { day: app.day };
            router.push({ path: 'sale/'+ (entry && entry.id ? entry.id : '_') });
        },
        chooseDay() {
            var app = this;
            app.$refs.dayChooser.open().then(day => {
                app.day = day;
                app.load();
            }); 
        },
        restore() {
            var app = this;
            if(app.$root.storedSalesOptions) {
                app.day = app.$root.storedSalesOptions.day;
                delete app.$root.storedSalesOptions;
                return true;
            }
            else
                return false;
        }
    }
}