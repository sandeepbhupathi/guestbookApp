(function() {
    window.App = {
        Models: {},
        Views: {},
        Collections: {},
        Routers: {}
    };

    var currentId;
    var currentGuestBookId;

    var vent = _.extend({}, Backbone.Events);

    //models
    App.Models.GuestBook = Backbone.Model.extend({
        defaults: {
            guestbook_id: "default"
        }
    });

    App.Models.Greeting = Backbone.Model.extend({
        defaults: {
            greeting_id: currentId,
            guestbook_id: currentGuestBookId,
            greeting: "greeting",
            auther_id: "auther_id",
            post_date: "greeting_date"
        }
    });

    App.Models.Auther = Backbone.Model.extend({
        defaults: {
            auther_id: "auther_id",
            name: "name"
        }
    });


    //views
    App.Views.GuestBookView = Backbone.View.extend({
        tagName: 'div',
        className: 'guestbook',
        id: 'guest-book',

        template: _.template($('#guestbookTemplate').html()),

        initialize: function() {
            $('#guestbook').html(this.render().$el);
        },
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    App.Views.GreetingView = Backbone.View.extend({
        tagName: 'li',
        className: 'list-group-item',
        id: 'greeting-list-item',

        model: App.Models.Greeting,

        template: _.template($('#greetingsListItemTemplate').html()),

        initialize: function() {
            $('#greeting').html(this.render().$el);
        },
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    App.Views.GreetingsView = Backbone.View.extend({
        tagName: 'ul',
        className: 'list-group',
        id: 'greetings-list',
        initialize: function() {
            vent.on('greetings:add', this.addGreeting, this);
            vent.on('guestbook:change', this.render, this);
            $('#greetingsList').html(this.render().$el);
        },

        render: function() {
            this.$el.empty();
            this.collection.each(function(greeting) {
                var guestbookId = greeting.get('guestbook_id');
                if (guestbookId == currentGuestBookId) {
                    var greetingView = new App.Views.GreetingView({
                        model: greeting
                    });

                    this.$el.append(greetingView.render().el);
                }
                $('#guestbook').html(guestbookView.render().$el);
            }, this);
            return this;
        },
        addGreeting: function(greeting) {
            this.collection.push(greeting);
            var newGreetingView = new App.Views.GreetingView({
                model: greeting
            });
            this.$el.append(newGreetingView.render().el);
        }
    });

    App.Views.CreateGreetingView = Backbone.View.extend({
        template: _.template($('#createGreetingTemplate').html()),

        events: {
            'submit #postGreeting': 'postGreeting',
            'submit #changeGuestbook': 'changeGuestbook'
        },

        postGreeting: function(e) {
            e.preventDefault();

            var newGreetingText = $(e.currentTarget).find('input[type=text]').val();
            var newGreeting = new App.Models.Greeting({
                greeting_id: currentId,
                guestbook_id: currentGuestBookId,
                greeting: newGreetingText,
                auther_id: "auther_id",
                post_date: new Date().toLocaleString()
            });

            vent.trigger('greetings:add', newGreeting);

            currentId = currentId + 1;
        },

        changeGuestbook: function(e) {
            e.preventDefault();
            var newGuestbookText = $(e.currentTarget).find('input[type=text]').val();
            guestbook.set('guestbook_id', newGuestbookText);
            currentGuestBookId = newGuestbookText;
            vent.trigger('guestbook:change', guestbook);
        },

        initialize: function() {
            $('#createGreeting').html(this.render().$el);
        },


        render: function() {
            this.$el.html(this.template());
            return this;
        }

    });
    //collections

    App.Collections.Greetings = Backbone.Collection.extend({
        model: App.Models.Greeting
    });


    //routers
    App.Routers.router = Backbone.Router.extend({
        routes: {
            '': 'index'
        },
        index: function() {
            console.log("This is just the index.html page");
        }
    });

    //ready
    $(document).ready(function() {
        currentGuestBookId = 'default';

        guestbook = new App.Models.GuestBook({
            'guestbook_id': currentGuestBookId
        });

        guestbookView = new App.Views.GuestBookView({
            model: guestbook
        });

        greetingsCollection = new App.Collections.Greetings();

        greetingsView = new App.Views.GreetingsView({
            collection: greetingsCollection
        });

        createGreetingView = new App.Views.CreateGreetingView({
            collection: greetingsCollection
        });

        new App.Routers.router();
        Backbone.history.start();
    });

})();