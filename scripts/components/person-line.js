Vue.component('person-line', { 
    mixins: [utilMixins],
    template:`
    <div class="columns is-mobile is-vcentered hover" @click="$emit('click');">
        <div class="column">
            <i v-if="!person.isBar" style='min-width:30px;text-align:center' :class="'fa fa-star f180 ' + ( person && person.isMember ? 'additional-text' : 'has-text-grey-lighter' )"  />
            <i v-if="person.isBar" style='min-width:30px;text-align:center' :class="'fa fa-euro-sign f180 has-text-success'"  />
        </div>
        <h6 class="column is-full">
            <h4 class="title is-5" v-if="mode !== 'chooser' && person.fullName">{{person.fullName}} <span class="has-text-grey has-text-weight-light is-size-6" v-if="person.dogNames">({{person.dogNames}})</span></h4>
            <h4 class="title is-5" v-if="mode === 'chooser' && person.nameWithGroup">{{person.nameWithGroup}} <span class="has-text-grey has-text-weight-light is-size-6" v-if="person.dogNames">({{person.dogNames}})</span></h4>
            <h6 class="subtitle is-5" v-if="mode==='chooser' && person.relatedNames && person.relatedNames.indexOf(',')>0">{{person.relatedNames}}</h6>
        </div>
    </div>
    `,
    props: {
        mode: { type: String },
        person: { type: Object }
    }
 });