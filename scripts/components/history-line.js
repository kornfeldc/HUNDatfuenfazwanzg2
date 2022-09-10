Vue.component('history-line', { 
    mixins: [utilMixins],
    template:`
    <div class="columns is-mobile is-vcentered hover" @click="click">
        <div class="column is-narrow">
            {{date}}
        </div>    
        <div class="column">
            <span v-if="history.type == 'sale'">
                Verkauf <span v-if="history.date !== history.additionalDate" class="has-text-grey is-size-7">({{additionalDate}})</span>
            </span>
            <span v-else>Guthaben aufgeladen</span>
        </div>
        <div class="column is-narrow has-text-success" style="min-width:100px;text-align:right">
            {{format(history.credit)}} €
        </div>
        <div class="column is-narrow warning-text" style="min-width:100px;text-align:right">
            {{format(history.amount)}} €
        </div>
    </div>
    `,
    props: {
        history: {}
    },
    computed: {
        date() {
            var app = this;
            if(!app.history.date && app.history.additionalDate) return moment(app.history.additionalDate,util.dateFormat).format("DD.MM.YYYY");
            if(!app.history.date) return "???";
            return moment(app.history.date,util.dateFormat).format("DD.MM.YYYY");
        },
        additionalDate() {
            var app = this;
            return moment(app.history.additionalDate,util.dateFormat).format("DD.MM.YY");
        }
    },
    methods: {
        click() {
            var app = this;
            if(app.history.saleId) {
                router.push({ path: '../sale/'+app.history.saleId });
            }
        }
    }
 });