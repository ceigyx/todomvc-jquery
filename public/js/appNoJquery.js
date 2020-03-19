/*global Handlebars, Router */

/*jshint esversion:6 */

//GOAL: Complete removal of jQuery -- DONE
//Conditions: App must run exactly as before, maintain general logic. -- DONE
//bonus points: maintain code structure -- DONE with polyfill


//start when ready
document.addEventListener('DOMContentLoaded', function(){
    'use strict';

//polyfill chainable .on to maintain mvc (fails if no selector, could be fixed by using 
//selector as the callback if not provided, or using array)
(function(){
    EventTarget.prototype.on = function(eventName, selector, callback) {
        this.addEventListener(eventName, function(e) {
            for (var target = e.target; target && target != this; target = target.parentNode) {
                if (target.matches(selector)) {
                    callback.call(target, e);
                    event.stopPropagation();
                    break;
                }
            }
        }, false);
        return this;
    };
    console.log("EventTarget function \"on\" added");
})();

    
    console.log("DOM loaded");
    
    //shorthand for query selector
    const $ =  document.querySelector.bind(document);
    
    Handlebars.registerHelper('eq', function (a, b, options) {
        return a === b ? options.fn(this) : options.inverse(this);
    });
    
    var ENTER_KEY = 13;
    var ESCAPE_KEY = 27;
    
    var util = {
         uuid: function () {
            /*jshint bitwise:false */
            var i, random;
            var uuid = '';
            for (i = 0; i < 32; i++) {
                random = Math.random() * 16 | 0;
                if (i === 8 || i === 12 || i === 16 || i === 20) {
                    uuid += '-';
                }
                uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
            }
            return uuid;
        },
        pluralize: function (count, word) {
            return count === 1 ? word : word + 's';
        },
        store: function (namespace, data) {
            if (arguments.length > 1) {
                return localStorage.setItem(namespace, JSON.stringify(data));
            } else {
                var store = localStorage.getItem(namespace);
                return (store && JSON.parse(store)) || [];
            }
        }
    };
    //util jQuery Removed
    
    var App = {
        init: function () {
            this.todos = util.store('todos-jquery');
            this.todoTemplate = Handlebars.compile($('#todo-template').innerHTML);
            this.footerTemplate = Handlebars.compile($('#footer-template').innerHTML);
            this.bindEvents();
            new Router({
                '/:filter': function (filter) {
                    this.filter = filter;
                    this.render();
                }.bind(this)
            }).init('/all');
        },
        //init jQuery Removed
    
        bindEvents: function () {
            
            $('#new-todo').addEventListener('keyup', this.create.bind(this));
            $('#toggle-all').addEventListener('change', this.toggleAll.bind(this));
            $('#footer').on('click', '#clear-completed', this.destroyCompleted.bind(this));
            $('#todo-list')
                .on('change', '.toggle', this.toggle.bind(this))
                .on('dblclick', 'label', this.editMode.bind(this))
                .on('keyup', '.edit', this.editModeKeyup.bind(this))
                .on('focusout', '.edit', this.updateTodo.bind(this))
                .on('click', '.destroy', this.destroy.bind(this));
        },
        //bindEvents jQuery Removed
        
        render: function () {
            var todos = this.getFilteredTodos();
            $('#todo-list').innerHTML = this.todoTemplate(todos);
            $('#main').style = (todos.length > 0)? "display:block" : "display:none";
            $('#toggle-all').checked = this.getActiveTodos().length === 0;
            this.renderFooter();
            $('#new-todo').focus();
            util.store('todos-jquery', this.todos);
        },
        //render jQuery Removed
    
        renderFooter: function () {
            var todoCount = this.todos.length;
            var activeTodoCount = this.getActiveTodos().length;
            var template = this.footerTemplate({
                activeTodoCount: activeTodoCount,
                activeTodoWord: util.pluralize(activeTodoCount, 'item'),
                completedTodos: todoCount - activeTodoCount,
                filter: this.filter
            });
            $('#footer').style = (todoCount > 0)? "display:block" : "display:none";
            $('#footer').innerHTML = template;
        },
        //renderFooter jQuery Removed
    
        toggleAll: function (e) {
            var isChecked = e.target.checked;
            this.todos.forEach(function (todo) {
                todo.completed = isChecked;
            });
            this.render();
        },
        //toggleAll jQuery Removed
    
        getActiveTodos: function () {
            return this.todos.filter(function (todo) {
                return !todo.completed;
            });
        },
        //getActiveTodos jQuery Removed
    
        getCompletedTodos: function () {
            return this.todos.filter(function (todo) {
                return todo.completed;
            });
        },
        //getCompletedTodos jQuery Removed
    
        getFilteredTodos: function () {
            if (this.filter === 'active') {
                return this.getActiveTodos();
            }
            if (this.filter === 'completed') {
                return this.getCompletedTodos();
            }
            return this.todos;
        },
        //getFilteredTodos jQuery Removed
    
        destroyCompleted: function () {
            this.todos = this.getActiveTodos();
            this.filter = 'all';
            this.render();
        },
        //destroyCompleted jQuery Removed
    
        indexFromEl: function (el) {
            var id = el.closest('li').dataset.id;
            var todos = this.todos;
            var i = todos.length;
            while (i--) {
                if (todos[i].id === id) {
                    return i;
                }
            }
        },
        //indexFromEl jQuery Removed
    
        create: function (e) {
            var input = e.target;
            var val = input.value.trim();
            if (e.which !== ENTER_KEY || !val) {
                return;
            }
            this.todos.push({
                id: util.uuid(),
                title: val,
                completed: false
            });
            input.value = "";
            this.render();
        },
        //create jQuery Removed
    
        toggle: function (e) {
            var i = this.indexFromEl(e.target);
            this.todos[i].completed = !this.todos[i].completed;
            this.render();
        },
        //toggle jQuery Removed
    
        editMode: function (e) {
            var input = e.target.closest('li');
            input.classList.add('editing');
            input.children[1].focus();
        },
        //editMode jQuery Removed
    
        editModeKeyup: function (e) {
            if (e.which === ENTER_KEY) {
                e.target.blur();
            }
            if (e.which === ESCAPE_KEY) {
                e.target.dataset.abort = true;
                e.target.blur();
            }
        },
        //editMdeKeyup jQuery Removed
        
        updateTodo: function (e) {
            var val = e.target.value.trim();
            if (!val) {
                this.destroy(e);
                return;
            }
            if (e.target.dataset.abort) {
                e.target.dataset.abort = false;
            } else {
                this.todos[this.indexFromEl(e.target)].title = val;
            }
            this.render();
        },
        //updateTodo jQuery Removed
    
        destroy: function (e) {
            this.todos.splice(this.indexFromEl(e.target), 1);
            this.render();
        }
        //destroy jQuery Removed
    
    };
    App.init();

});


