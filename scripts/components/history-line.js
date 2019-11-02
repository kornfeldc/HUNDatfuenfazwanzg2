Vue.component('history-line', { 
    mixins: [utilMixins],
    template:`
    <div class="columns is-mobile is-vcentered hover" @click="click">
        <div class="column is-narrow">
            {{date}}
        </div>    
        <div class="column">
            <span v-if="history.type == 'sale'">Verkauf</span>
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
            return moment(app.history.date,util.dateFormat).format("DD.MM.YYYY");
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