Vue.component('sale-line', { 
    mixins: [utilMixins],
    template:`
    <div class="box hover">
        <div class="columns is-mobile" @click="$emit('click');">
            <div class="column ">
                <div class="title is-5">{{sale.personName}} <span class="has-text-grey has-text-weight-light is-size-6" v-if="sale.dogNames">({{sale.dogNames}})</span></div>
                <div class="subtitle is-6">
                    <div v-if="!sale.isToday">{{sale.saleDateDay}}</div>
                    <span>{{articlesText}}</span>
                </div>
            </div>
            <div :class="'column is-narrow ' + (sale.isPayed ? 'has-text-success' : 'warning-text')">
                <template v-if="sale.canPayWithCredit">
                    <i class="fas fa-badge-check has-text-success pr-1"/>
                    <span v-if="sale.canPayWithCredit">&nbsp;&nbsp;</span>
                </template>
                <b>{{format(sale.articleSum)}}</b>
            </div>
        </div>
    </div>
    `,
    props: {
        sale: { type: Object }
    },
    computed: {
        articlesText() {
            var app = this;
            var str = "";
            util.log("sale-line, articles", app.sale.articles);
            if(app.sale.articles && app.sale.articles.length > 0) {
                app.sale.articles.forEach(sa => str += sa.amount + "x "+sa.article.title+ ", ");
                str = str.substr(0,str.length-2);
            }
            return str;
        }
    }
 });