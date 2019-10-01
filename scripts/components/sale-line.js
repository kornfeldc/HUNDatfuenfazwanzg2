Vue.component('sale-line', { 
    mixins: [utilMixins],
    template:`
    <div class="box hover">
        <div class="columns is-mobile" @click="$emit('click');">
            <div class="column ">
                <div class="title is-5">{{sale.person.nameWithGroup}}</div>
                <div class="subtitle is-6">
                    <div v-if="!sale.isToday">{{sale.saleDateDay}}</div>
                    <span>{{articlesText}}</span>
                </div>
            </div>
            <div :class="'column is-narrow ' + (sale.isPayed ? 'has-text-success' : 'warning-text')">
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
            if(app.sale.articles && app.sale.articles.length > 0) {
                app.sale.articles.forEach(sa => str += sa.amount + "x "+sa.article.title+ ", ");
                str = str.substr(0,str.length-2);
            }
            return str;
        }
    }
 });