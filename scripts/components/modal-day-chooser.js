Vue.component('modal-day-chooser', { 
    mixins: [utilMixins],
    template:`
    <div class="modal" ref="modal">
        <div class="modal-background"></div>
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title">Tag auswählen</p>
                <button class="delete" aria-label="close" @click="vibrate();cancel();"></button>
            </header>
            <section class="modal-card-body" v-if="render">
                <template v-if="$root.syncInfo.allSales==='idle'" v-for="day in dayList">
                    <div class="columns is-mobile is-vcentered hover" @click="vibrate();selectDay(day.day);">
                        <div class="column">
                            {{day.dayText}}    
                        </div>
                        <div class="column is-narrow warning-text" style="min-width:100px;text-align:right" v-show="day.topay!=0">
                            {{format(day.topay)}}
                        </div>
                        <div class="column is-narrow has-text-success" style="min-width:100px;text-align:right">
                            {{format(day.payed)}}
                        </div>
                    </div>
                </template>
                <a v-if="$root.syncInfo.allSales==='syncing'" class="button is-loading is-large is-fullwidth is-link is-outlined" style="border:0">Loading</a>
            </section>
            <footer class="modal-card-foot">
                <button-primary @click="vibrate();today();">Heute</button-primary>
                <button-cancel @click="vibrate();cancel();"/>
            </footer>
        </div>
    </div>
    `,
    data() {
        return {
            resolve: null,
            reject: null,
            dayList: [],
            render: true
        };
    },
    methods: {
        open() {
            var app = this;
            app.tab = "favorites";
            
            app.$emit("syncStart");
            Sale.getDayList().then(dayList => {
                app.dayList = dayList;
                app.$emit("syncStop");
                $(app.$refs.modal).addClass("is-active");
            });   

            app.render=false;
            app.$nextTick(()=>app.render=true);

            return new Promise((resolve, reject) => {
                app.resolve = resolve;
                app.reject = reject;
            });
        },
        selectDay(day) {
            var app = this;
            $(app.$refs.modal).removeClass("is-active");
            app.resolve(day);
        },
        today() {
            this.selectDay(moment().format("DD.MM.YYYY"));
        },
        cancel() {
            var app = this;
            $(app.$refs.modal).removeClass("is-active");
            app.reject();
        }
    }
 });
