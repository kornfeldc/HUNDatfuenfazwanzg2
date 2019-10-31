Vue.component('history-line', { 
    mixins: [utilMixins],
    template:`
    <div class="columns is-mobile is-vcentered hover" @click="$emit('click');">
        <div class="column">
            xx
        </div>
        <div class="column is-full">
            {{date}}
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
    }
 });