Vue.component('course-person-card', { 
    mixins: [utilMixins],
    template:`
    <div class="box">
        <div class="is-size-5" style="min-width:175px">{{person.nameWithGroup}}  <span class="has-text-grey has-text-weight-light is-size-6" v-if="person.dogNames">({{person.dogNames}})</span></div>
        <div :class="' ' + (person.courseCount <= 0 ? 'red-text' : 'has-text-success') " >{{person.courseCount}} Kurs(e) frei</div>
    </div>
    `,
    props: {
        person: { type: Object }
    },
    data() {
        return {
        };
    },
    methods: {
    }
 });