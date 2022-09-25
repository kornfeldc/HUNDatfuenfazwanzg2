Vue.component('sale-person', { 
    mixins: [utilMixins],
    template:`
    <div class="box" @click="$emit('click')">
        <div class="media">
            <div class="media-content">
                <p class="title is-5">{{person.nameWithGroup}}</p>
            </div>
            <div class="media-right">
                {{sale.saleDayShort}}
            </div>
        </div>
        <div class="media" v-if="!person.isBar">
            <div class="media-content">
                Guthaben
            </div>
            <div class="media-right">
                € {{format(personCredit)}}
            </div>
        </div>
        <div class="media" v-if="person.courseHistoryCount > 0" @click="e=> { e.stopPropagation(); e.preventDefault(); $emit('courses-click'); }">
            <div :class="'media-content ' + (person.courseCount <= 0 ? 'red-text' : '') " >
                Kurse Frei
            </div>
            <div :class="'media-right ' + (person.courseCount <= 0 ? 'red-text' : '') " >
                {{person.courseCount}}
            </div>
        </div>
        <div class="field pt-std" v-if="mode === 'pay' && !person.isBar">
            <div class="flx vcenter">
                <div class="pr-std">Mit Guthaben zahlen:</div>
                <button class="button is-small is-success " v-if="value" @click="$emit('input',false)">JA</button>
                <button class="button is-small is-danger" v-if="!value" @click="$emit('input',true)">NEIN</button>
                <div style="flex-grow:1;text-align:right">Summe: € {{format(sale.articleSum)}}</div>
            </div>
        </div>
    </div>
    `,
    props: {
        value: { type: Boolean, default: false },
        mode: { type: String, default: "" },
        sale: { type: Object },
        person: { type: Object }
    },
    computed: {
        personCredit() {
            var app = this;
            var credit = app.person.credit || 0;
            // if(app.sale) {
            //     var creditSaleArticle = (app.sale.articles||[]).find(sa => sa.article.id === "credit");
            //     if(creditSaleArticle)
            //         credit += creditSaleArticle.article.price;
            // }
            return credit;
        },
    },
    methods:{
        addCredit() {}
    }
 });