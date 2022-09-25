//initialize vue app
new Vue({
    el: "#app",
    data() {
        return {
            link: null,
            date: undefined,
            courseIsFull: undefined,
            personName: "",
            dogName: "",
            success: undefined
        };
    },
    computed: {
        
    },
    async created() {
        var app = this;
        const link = window.location.search.substr(1);
        if(link && link.length === 6) {
            this.link = link;

            this.personName = localStorage ? localStorage.getItem("rcl_personName") : "";
            this.dogName = localStorage ? localStorage.getItem("rcl_dogName") : "";

            await app.loadCourse(link);
        }
        else
            app.invalid();
    },
    mounted() {
        var app = this;
        $("#logo").fadeOut(500);
        setTimeout(()=>$("#app").fadeIn(800),300);        
    },
    updated() {
        var app = this;
    },
    methods: {
        async loadCourse(link) {
            const response = await fetch("/api/rcl.php?link="+link, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Encoding': 'gzip'
                  }
            });
            if(!response) {
                this.invalid();
                return;
            }
            const data = await response.json();
            if(!data) {
                this.invalid();
                return;
            }
            if(data.link !== link) {
                this.invalid();
                return;
            }

            this.courseIsFull = data.personCount >= data.maxPersons; 
            this.date = data.date;
        },
        invalid() {
            window.location.href = "https://svoe.og125.at";
        },
        async save() {
            // save my name and dogs name in browser storage
            localStorage.setItem("rcl_personName", this.personName);
            localStorage.setItem("rcl_dogName", this.dogName);

            // check again if course if full (if the site was opened for longer)
            await this.loadCourse(this.link);
            if(!this.courseIsFull && this.personName && this.dogName) {
                // save the person
                var form = new FormData();
                form.append('personName', this.personName);
                form.append('dogName', this.dogName);

                const response = await fetch("/api/rcl.php?link="+this.link, {
                    method: "POST",
                    body: form
                });

                try {
                    if(!response) {
                        this.registerFailed();
                        return;
                    }
                    const data = await response.json();
                    if(!data) {
                        this.registerFailed();
                        return;
                    }
                    this.success = true;
                    setTimeout(() => {
                       this.invalid();
                    }, 2000);
                }
                catch(e) {
                    this.registerFailed();
                    return;
                }
              
            }

        },
        registerFailed() {
            alert("Leider ist etwas schief gelaufen, bitte versuchs nochmal");
        }
    }
});
