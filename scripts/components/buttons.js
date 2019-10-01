Vue.component('button-primary', { 
    template: `<button class="button is-link" @click="$emit('click')"><slot></slot></button>`,
});

Vue.component('button-primary-inverted', { 
    template: `<button class="button is-link is-outlined" @click="$emit('click')"><slot></slot></button>`,
});

Vue.component('button-success', { 
    template: `<button class="button is-success" @click="$emit('click')"><slot></slot></button>`,
});

Vue.component('button-success-inverted', { 
    template: `<button class="button is-success is-outlined" @click="$emit('click')"><slot></slot></button>`,
});

Vue.component('button-danger', { 
    template: `<button class="button is-danger" @click="$emit('click')"><slot></slot></button>`,
});

Vue.component('button-danger-inverted', { 
    template: `<button class="button is-danger is-outlined" @click="$emit('click')"><slot></slot></button>`,
});

Vue.component('button-text', { 
    template: `<button class="button is-outlined" @click="$emit('click')"><slot></slot></button>`,
});

Vue.component('button-cancel', { 
    template: `<button-text @click="$emit('click')">Abbrechen</button-text>`,
});