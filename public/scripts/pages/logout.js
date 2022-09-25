const LogoutPage = {
    template: `
    <div class="p-std">
    </div>
    `,
    data() {
        return {
            dbUrl: "",
            email: ""
        };
    },
    created() {
        var app = this;
        storage.clear("user");
        app.$parent.groupTitle = "";
        router.push({path: "/login"});
    }
}