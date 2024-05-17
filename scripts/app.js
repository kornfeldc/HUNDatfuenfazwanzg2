const VERSION ="2.2.8";

//define routes
const router = new VueRouter({
    routes:  [
         { path: '/articles', component: ArticlesPage, meta: { title:"Artikel" } },
         { path: '/course', component: CoursePage, meta: { title: "Kurseinheiten" } },
         { path: '/rob', component: RobPage, meta: { title: "ROB" } },
         { path: '/persons', component: PersonsPage, meta: { title: "Personen" } }  ,
         { path: '/sales', component: SalesPage, meta: { title: "Verkauf" } },
         { path: '/logout', component: LogoutPage, meta: { title: "Logout" } },
         { path: '/login', component: LoginPage, meta: { title: "Login" } },
         { path: '/', component: LoginPage, meta: { title: "Login" } },

         { path: '/sale/:id', component: SalePage, meta: { title: "Verkauf" } },
         { path: '/person/:id', component: PersonPage, meta: { title: "Person" } },
         { path: '/article/:id', component: ArticlePage, meta: { title:"Artikel" } },
         { path: '/pay/:id', component: PayPage, meta: { title:"Bezahlen" } },
         { path: '/robcourse/:id', component: RobCoursePage, meta: { title: "ROB" } },
    ]
});

const COLOR_PRIMARY = "#1976d2";

//initialize vue app
new Vue({
    el: "#app",
    router: router,
    data() {
        return {
            groupTitle: "",
            isLoggedIn: false,
            version: VERSION
        };
    },
    computed: {
        
    },
    created() {
        var app = this;
        console.log("app created", this);
        moment.locale("de");
    },
    mounted() {
        var app = this;
        app.initializeNavigation();

        $("#logo").fadeOut(500);
        setTimeout(()=>$("#app").fadeIn(800),300);

        if(this.iOS())
            $("body").addClass("ios");
    },
    updated() {
        var app = this;
    },
    methods: {
        initializeNavigation() {
            $(".navbar-burger, .navbar-item").click(function() {
                $(".navbar-burger").toggleClass("is-active");
                $(".navbar-menu").toggleClass("is-active");
            });
        },
        reload() {
            window.location.reload();
        },
        iOS: () => {
            return [
                    'iPad Simulator',
                    'iPhone Simulator',
                    'iPod Simulator',
                    'iPad',
                    'iPhone',
                    'iPod'
                ].includes(navigator.platform)
                // iPad on iOS 13 detection
                || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
        }
    }
});
