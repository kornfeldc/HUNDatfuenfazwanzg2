Vue.component('page-container', { 
    template:`
    <div class="p-std">
        <div>
            <slot></slot>
        </div>
        <!--<a v-if="syncing" class="button is-loading is-large is-fullwidth is-link is-outlined" style="border:0">Loading</a>-->
        <progress v-if="syncing" class="progress fixed is-small is-link" max="100">15%</progress>
    </div>
    `,
    props: {
        syncing: { type: Boolean, default: false }
    }
 });