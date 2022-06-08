
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.48.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Chat.svelte generated by Svelte v3.48.0 */

    const { Object: Object_1, console: console_1 } = globals;
    const file = "src/Chat.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (95:12) {:else}
    function create_else_block(ctx) {
    	let div;
    	let t_value = /*message*/ ctx[6].text + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "messageLeft svelte-g5s0j8");
    			add_location(div, file, 95, 12, 2583);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*messages*/ 1 && t_value !== (t_value = /*message*/ ctx[6].text + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(95:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (93:12) {#if message.origin === 'you'}
    function create_if_block(ctx) {
    	let div;
    	let t_value = /*message*/ ctx[6].text + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "messageRight svelte-g5s0j8");
    			add_location(div, file, 93, 12, 2502);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*messages*/ 1 && t_value !== (t_value = /*message*/ ctx[6].text + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(93:12) {#if message.origin === 'you'}",
    		ctx
    	});

    	return block;
    }

    // (91:8) {#each messages as message}
    function create_each_block(ctx) {
    	let div;
    	let t;

    	function select_block_type(ctx, dirty) {
    		if (/*message*/ ctx[6].origin === 'you') return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			t = space();
    			attr_dev(div, "class", "message svelte-g5s0j8");
    			add_location(div, file, 91, 8, 2423);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, t);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(91:8) {#each messages as message}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let div0;
    	let t0;
    	let div1;
    	let textarea;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;
    	let each_value = /*messages*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div1 = element("div");
    			textarea = element("textarea");
    			t1 = space();
    			button = element("button");
    			button.textContent = "SEND";
    			set_style(div0, "overflow", "auto");
    			set_style(div0, "opacity", "1.0");
    			add_location(div0, file, 89, 4, 2335);
    			attr_dev(textarea, "id", "message-box");
    			attr_dev(textarea, "type", "text");
    			attr_dev(textarea, "class", "message-input svelte-g5s0j8");
    			attr_dev(textarea, "placeholder", "Type message...");
    			add_location(textarea, file, 102, 8, 2732);
    			attr_dev(button, "class", "message-send svelte-g5s0j8");
    			add_location(button, file, 103, 8, 2851);
    			attr_dev(div1, "class", "message-box svelte-g5s0j8");
    			add_location(div1, file, 101, 4, 2696);
    			attr_dev(main, "class", "svelte-g5s0j8");
    			add_location(main, file, 88, 0, 2324);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(main, t0);
    			append_dev(main, div1);
    			append_dev(div1, textarea);
    			append_dev(div1, t1);
    			append_dev(div1, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*messages*/ 1) {
    				each_value = /*messages*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Chat', slots, []);
    	let { userid } = $$props;
    	var messages = [];
    	var last_id = -1;

    	afterUpdate(() => {
    		if (last_id != userid) {
    			$$invalidate(0, messages = []);
    			getMessages(0, 2);
    			console.log("update");
    			last_id = userid;
    		}
    	});

    	/*async*/
    	function getMessages(depth, n) {
    		/* var dict = {"token" : "abc" ,
                 "type"   : "getMessages",
                 "params" : {
                     "userid" : userid ,
                     "depth"    : depth ,
                     "count"   : n
                 }
             };

     const res = await fetch('https://localhost:5000' , {
         method: 'POST',
         body : JSON.stringify(dict) 
     });

     const awnser = await res.json();
     */
    		let awnser;

    		if (userid == 0xff) awnser = {
    			0: { "origin": "you", "text": "User ff" },
    			1: {
    				"origin": "target",
    				"text": "Example of a message"
    			}
    		};

    		if (userid == 0xf1) awnser = {
    			0: { "origin": "you", "text": "User f1" },
    			1: {
    				"origin": "target",
    				"text": "Example of a message"
    			}
    		};

    		if (userid == 0xf3) awnser = {
    			0: { "origin": "you", "text": "User f3" },
    			1: {
    				"origin": "target",
    				"text": "Example of a message"
    			}
    		};

    		let c = 0;

    		for (let i = depth + n - 1; i >= depth; i--) {
    			if (c < Object.keys(awnser).length) messages.push(awnser[i - depth]); else {
    				break;
    			}

    			c++;
    		}
    	}

    	function sendMessage() {
    		var h = document.getElementById("message-box");

    		if (h.value != "") {
    			var dict = {
    				"token": "abc",
    				"type": "sendMessage",
    				"params": { userid, "message": h.value }
    			};

    			/*const res = await fetch('https://localhost:5000' , {
        method: 'POST',
        body : JSON.stringify(dict)
    });
    */
    			$$invalidate(0, messages = [...messages, { "origin": "you", "text": h.value }]);

    			h.value = "";
    		}
    	}

    	const writable_props = ['userid'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Chat> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		sendMessage();
    	};

    	$$self.$$set = $$props => {
    		if ('userid' in $$props) $$invalidate(2, userid = $$props.userid);
    	};

    	$$self.$capture_state = () => ({
    		afterUpdate,
    		userid,
    		messages,
    		last_id,
    		getMessages,
    		sendMessage
    	});

    	$$self.$inject_state = $$props => {
    		if ('userid' in $$props) $$invalidate(2, userid = $$props.userid);
    		if ('messages' in $$props) $$invalidate(0, messages = $$props.messages);
    		if ('last_id' in $$props) last_id = $$props.last_id;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [messages, sendMessage, userid, click_handler];
    }

    class Chat extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { userid: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Chat",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*userid*/ ctx[2] === undefined && !('userid' in props)) {
    			console_1.warn("<Chat> was created without expected prop 'userid'");
    		}
    	}

    	get userid() {
    		throw new Error("<Chat>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set userid(value) {
    		throw new Error("<Chat>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Tasks.svelte generated by Svelte v3.48.0 */

    const { console: console_1$1 } = globals;
    const file$1 = "src/Tasks.svelte";

    // (105:8) {:else}
    function create_else_block_1(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(105:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (76:8) {#if state === "read"}
    function create_if_block$1(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*parameters*/ ctx[1] === undefined) return create_if_block_1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(76:8) {#if state === \\\"read\\\"}",
    		ctx
    	});

    	return block;
    }

    // (80:12) {:else }
    function create_else_block$1(ctx) {
    	let p0;
    	let t0;
    	let p1;
    	let t1;
    	let div0;
    	let div1;
    	let t3_value = /*parameters*/ ctx[1]["priority"] + "";
    	let t3;
    	let t4;
    	let p2;
    	let t5;
    	let div2;
    	let input;
    	let div3;
    	let t7;
    	let p3;
    	let t8;
    	let div4;
    	let div5;
    	let t10_value = /*parameters*/ ctx[1]["start"] + "";
    	let t10;
    	let t11;
    	let div6;
    	let div7;
    	let t13_value = /*parameters*/ ctx[1]["end"] + "";
    	let t13;
    	let t14;
    	let p4;
    	let t15;
    	let div8;
    	let t16_value = /*parameters*/ ctx[1]["description"] + "";
    	let t16;
    	let t17;
    	let p5;
    	let t18;
    	let p6;
    	let t19;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			t0 = space();
    			p1 = element("p");
    			t1 = space();
    			div0 = element("div");
    			div0.textContent = "Priority : ";
    			div1 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			p2 = element("p");
    			t5 = space();
    			div2 = element("div");
    			div2.textContent = "Progress : ";
    			input = element("input");
    			div3 = element("div");
    			t7 = space();
    			p3 = element("p");
    			t8 = space();
    			div4 = element("div");
    			div4.textContent = "Start : ";
    			div5 = element("div");
    			t10 = text(t10_value);
    			t11 = space();
    			div6 = element("div");
    			div6.textContent = "End : ";
    			div7 = element("div");
    			t13 = text(t13_value);
    			t14 = space();
    			p4 = element("p");
    			t15 = space();
    			div8 = element("div");
    			t16 = text(t16_value);
    			t17 = space();
    			p5 = element("p");
    			t18 = space();
    			p6 = element("p");
    			t19 = space();
    			button = element("button");
    			button.textContent = "Conclude task!";
    			add_location(p0, file$1, 80, 16, 1684);
    			add_location(p1, file$1, 82, 16, 1725);
    			attr_dev(div0, "class", "field svelte-5gh4uq");
    			set_style(div0, "background-color", "rgb(231, 231, 231)");
    			add_location(div0, file$1, 83, 16, 1749);
    			attr_dev(div1, "class", "field svelte-5gh4uq");
    			add_location(div1, file$1, 83, 99, 1832);
    			add_location(p2, file$1, 84, 16, 1900);
    			attr_dev(div2, "class", "field svelte-5gh4uq");
    			set_style(div2, "background-color", "rgb(231, 231, 231)");
    			add_location(div2, file$1, 85, 16, 1924);
    			attr_dev(input, "type", "range");
    			attr_dev(input, "min", "0");
    			attr_dev(input, "max", "100");
    			input.value = "0";
    			add_location(input, file$1, 85, 99, 2007);
    			add_location(div3, file$1, 85, 147, 2055);
    			add_location(p3, file$1, 86, 16, 2083);
    			attr_dev(div4, "class", "field svelte-5gh4uq");
    			set_style(div4, "background-color", "rgb(231, 231, 231)");
    			add_location(div4, file$1, 87, 16, 2107);
    			attr_dev(div5, "class", "field svelte-5gh4uq");
    			add_location(div5, file$1, 87, 96, 2187);
    			attr_dev(div6, "class", "field svelte-5gh4uq");
    			set_style(div6, "background-color", "rgb(231, 231, 231)");
    			add_location(div6, file$1, 88, 16, 2252);
    			attr_dev(div7, "class", "field svelte-5gh4uq");
    			add_location(div7, file$1, 88, 94, 2330);
    			add_location(p4, file$1, 89, 16, 2393);
    			attr_dev(div8, "class", "field description svelte-5gh4uq");
    			add_location(div8, file$1, 90, 16, 2417);
    			add_location(p5, file$1, 92, 16, 2518);
    			add_location(p6, file$1, 94, 16, 2559);
    			attr_dev(button, "class", "concludeButton svelte-5gh4uq");
    			add_location(button, file$1, 97, 16, 2617);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t3);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, input, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, p3, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, t10);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div6, anchor);
    			insert_dev(target, div7, anchor);
    			append_dev(div7, t13);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, p4, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, div8, anchor);
    			append_dev(div8, t16);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, p5, anchor);
    			insert_dev(target, t18, anchor);
    			insert_dev(target, p6, anchor);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*parameters*/ 2 && t3_value !== (t3_value = /*parameters*/ ctx[1]["priority"] + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*parameters*/ 2 && t10_value !== (t10_value = /*parameters*/ ctx[1]["start"] + "")) set_data_dev(t10, t10_value);
    			if (dirty & /*parameters*/ 2 && t13_value !== (t13_value = /*parameters*/ ctx[1]["end"] + "")) set_data_dev(t13, t13_value);
    			if (dirty & /*parameters*/ 2 && t16_value !== (t16_value = /*parameters*/ ctx[1]["description"] + "")) set_data_dev(t16, t16_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(div6);
    			if (detaching) detach_dev(div7);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(div8);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(p5);
    			if (detaching) detach_dev(t18);
    			if (detaching) detach_dev(p6);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(80:12) {:else }",
    		ctx
    	});

    	return block;
    }

    // (78:12) {#if parameters === undefined}
    function create_if_block_1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Waiting for server response ...";
    			add_location(p, file$1, 78, 16, 1608);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(78:12) {#if parameters === undefined}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let main;
    	let div;

    	function select_block_type(ctx, dirty) {
    		if (/*state*/ ctx[0] === "read") return create_if_block$1;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "taskBox svelte-5gh4uq");
    			add_location(div, file$1, 74, 4, 1493);
    			add_location(main, file$1, 72, 0, 1481);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tasks', slots, []);
    	let { taskid } = $$props;
    	let state = "";
    	let last_id = -1;

    	if (taskid == undefined) state = "write"; else {
    		state = "read";
    	}

    	afterUpdate(() => {
    		if (last_id != taskid) {
    			if (taskid == 1) {
    				$$invalidate(1, parameters = {
    					"status": "accepted",
    					"start": "6/6 - 15:00",
    					"end": "7/6 - 14:00",
    					"priority": "Alta",
    					"description": "Descrição detalhada da tarefa aqui"
    				});
    			}

    			if (taskid == 2) {
    				$$invalidate(1, parameters = {
    					"status": "accepted",
    					"start": "5/6 - 15:00",
    					"end": "6/6 - 14:00",
    					"priority": "Baixa",
    					"description": "Descrição detalhada da tarefa aqui"
    				});
    			}

    			last_id = taskid;
    		}
    	});

    	let parameters = undefined;
    	console.log(taskid);

    	async function getTask(id) {
    		//send task id in request
    		var dict = {
    			"token": "abc",
    			"type": "getTask",
    			"params": { "id": taskid }
    		};

    		const res = await fetch('https://localhost:5000', {
    			method: 'POST',
    			body: JSON.stringify(dict)
    		});

    		if (res["status"] === "accepted") {
    			return res;
    		}
    	}

    	const writable_props = ['taskid'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Tasks> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		console.log("remove task");
    	};

    	$$self.$$set = $$props => {
    		if ('taskid' in $$props) $$invalidate(2, taskid = $$props.taskid);
    	};

    	$$self.$capture_state = () => ({
    		afterUpdate,
    		taskid,
    		state,
    		last_id,
    		parameters,
    		getTask
    	});

    	$$self.$inject_state = $$props => {
    		if ('taskid' in $$props) $$invalidate(2, taskid = $$props.taskid);
    		if ('state' in $$props) $$invalidate(0, state = $$props.state);
    		if ('last_id' in $$props) last_id = $$props.last_id;
    		if ('parameters' in $$props) $$invalidate(1, parameters = $$props.parameters);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [state, parameters, taskid, click_handler];
    }

    class Tasks extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { taskid: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tasks",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*taskid*/ ctx[2] === undefined && !('taskid' in props)) {
    			console_1$1.warn("<Tasks> was created without expected prop 'taskid'");
    		}
    	}

    	get taskid() {
    		throw new Error("<Tasks>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set taskid(value) {
    		throw new Error("<Tasks>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const token = writable(0);
    const logged = writable(false);

    /* src/Login.svelte generated by Svelte v3.48.0 */

    const { console: console_1$2 } = globals;
    const file$2 = "src/Login.svelte";

    function create_fragment$2(ctx) {
    	let main;
    	let div0;
    	let t1;
    	let div2;
    	let div1;
    	let h2;
    	let t3;
    	let input0;
    	let t4;
    	let input1;
    	let t5;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			div0.textContent = "NSN - Seguros";
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Please login";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			button = element("button");
    			button.textContent = "Login";
    			attr_dev(div0, "class", "title svelte-2o54b0");
    			add_location(div0, file$2, 36, 4, 691);
    			attr_dev(h2, "class", "form-signin-heading svelte-2o54b0");
    			add_location(h2, file$2, 39, 10, 809);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "form-control svelte-2o54b0");
    			attr_dev(input0, "id", "user");
    			attr_dev(input0, "placeholder", "Email Address");
    			input0.required = "";
    			input0.autofocus = "";
    			add_location(input0, file$2, 40, 10, 869);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "class", "form-control svelte-2o54b0");
    			attr_dev(input1, "id", "pass");
    			attr_dev(input1, "placeholder", "Password");
    			input1.required = "";
    			add_location(input1, file$2, 41, 10, 985);
    			attr_dev(button, "class", "btn btn-lg btn-primary btn-block");
    			add_location(button, file$2, 43, 10, 1093);
    			attr_dev(div1, "class", "form-signin svelte-2o54b0");
    			add_location(div1, file$2, 38, 8, 766);
    			attr_dev(div2, "class", "wrapper svelte-2o54b0");
    			add_location(div2, file$2, 37, 4, 736);
    			add_location(main, file$2, 35, 0, 680);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(main, t1);
    			append_dev(main, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h2);
    			append_dev(div1, t3);
    			append_dev(div1, input0);
    			append_dev(div1, t4);
    			append_dev(div1, input1);
    			append_dev(div1, t5);
    			append_dev(div1, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Login', slots, []);

    	async function login() {
    		/*let user = document.getElementById("user").value;
    let pass = document.getElementById("pass").value;
    		const res = await fetch('https://link.tld/login?username=' + user + '&password=' + pass, {
    			method: 'GET'
    		})
    		
    		const json = await res.json()
    		result = JSON.stringify(json)

    		*/
    		//let result = {"status" : "rejected"};
    		let result = { "status": "accepted", "token": 0xf };

    		{
    			token.set(result["token"]);
    			logged.set(true);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		login();
    	};

    	$$self.$capture_state = () => ({ token, logged, login });
    	return [login, click_handler];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/Workflow.svelte generated by Svelte v3.48.0 */
    const file$3 = "src/Workflow.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    // (39:16) {:else}
    function create_else_block$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "circle svelte-cgvyw8");
    			set_style(div, "background-color", "red");
    			add_location(div, file$3, 40, 16, 940);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(39:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (37:16) {#if index < apiResponse["progress"]}
    function create_if_block$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "circle svelte-cgvyw8");
    			set_style(div, "background-color", "greenyellow");
    			add_location(div, file$3, 37, 20, 817);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(37:16) {#if index < apiResponse[\\\"progress\\\"]}",
    		ctx
    	});

    	return block;
    }

    // (34:8) {#each apiResponse["steps"] as step , index}
    function create_each_block$1(ctx) {
    	let div2;
    	let div0;
    	let t0_value = /*step*/ ctx[3]["description"] + "";
    	let t0;
    	let t1;
    	let t2;
    	let div1;
    	let t4;

    	function select_block_type(ctx, dirty) {
    		if (/*index*/ ctx[5] < /*apiResponse*/ ctx[1]["progress"]) return create_if_block$2;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			if_block.c();
    			t2 = space();
    			div1 = element("div");
    			div1.textContent = "->";
    			t4 = space();
    			attr_dev(div0, "class", "description svelte-cgvyw8");
    			add_location(div0, file$3, 35, 16, 688);
    			add_location(div1, file$3, 42, 20, 1040);
    			attr_dev(div2, "class", "step svelte-cgvyw8");
    			add_location(div2, file$3, 34, 12, 651);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			if_block.m(div2, null);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div2, t4);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(34:8) {#each apiResponse[\\\"steps\\\"] as step , index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let main;
    	let t0;
    	let t1;
    	let t2;
    	let div;
    	let each_value = /*apiResponse*/ ctx[1]["steps"];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			t0 = text("Workflow ");
    			t1 = text(/*workflowid*/ ctx[0]);
    			t2 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "box svelte-cgvyw8");
    			add_location(div, file$3, 31, 4, 565);
    			add_location(main, file$3, 28, 0, 523);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, t0);
    			append_dev(main, t1);
    			append_dev(main, t2);
    			append_dev(main, div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*workflowid*/ 1) set_data_dev(t1, /*workflowid*/ ctx[0]);

    			if (dirty & /*apiResponse*/ 2) {
    				each_value = /*apiResponse*/ ctx[1]["steps"];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getWorkflow() {
    	return {
    		"status": "accepted",
    		"name": "workflow name",
    		"progress": 1,
    		"steps": [
    			{
    				"assignee_id": "id",
    				"description": "description text"
    			},
    			{
    				"assignee_id": "id2",
    				"description": "DESC2"
    			}
    		]
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Workflow', slots, []);
    	let { workflowid } = $$props;
    	var last_id = -1;

    	afterUpdate(() => {
    		if (last_id != workflowid) {
    			last_id = workflowid;
    		}
    	});

    	let apiResponse = getWorkflow();
    	const writable_props = ['workflowid'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Workflow> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('workflowid' in $$props) $$invalidate(0, workflowid = $$props.workflowid);
    	};

    	$$self.$capture_state = () => ({
    		afterUpdate,
    		workflowid,
    		last_id,
    		getWorkflow,
    		apiResponse
    	});

    	$$self.$inject_state = $$props => {
    		if ('workflowid' in $$props) $$invalidate(0, workflowid = $$props.workflowid);
    		if ('last_id' in $$props) last_id = $$props.last_id;
    		if ('apiResponse' in $$props) $$invalidate(1, apiResponse = $$props.apiResponse);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [workflowid, apiResponse];
    }

    class Workflow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { workflowid: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Workflow",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*workflowid*/ ctx[0] === undefined && !('workflowid' in props)) {
    			console.warn("<Workflow> was created without expected prop 'workflowid'");
    		}
    	}

    	get workflowid() {
    		throw new Error("<Workflow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set workflowid(value) {
    		throw new Error("<Workflow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.48.0 */

    const { console: console_1$3, document: document_1 } = globals;
    const file$4 = "src/App.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	child_ctx[18] = i;
    	return child_ctx;
    }

    // (135:1) {:else}
    function create_else_block$3(ctx) {
    	let nav;
    	let a0;
    	let i0;
    	let t0;
    	let button;
    	let span;
    	let t1;
    	let div0;
    	let ul0;
    	let li0;
    	let a1;
    	let t2;
    	let i1;
    	let t3;
    	let li1;
    	let a2;
    	let t4;
    	let i2;
    	let t5;
    	let li2;
    	let a3;
    	let t6;
    	let i3;
    	let t7;
    	let li3;
    	let a4;
    	let t8;
    	let i4;
    	let t9;
    	let ul1;
    	let li4;
    	let a5;
    	let i5;
    	let t10;
    	let t11;
    	let li5;
    	let a6;
    	let t12;
    	let i6;
    	let t13;
    	let div4;
    	let div2;
    	let div1;
    	let t14;
    	let div3;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*options*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const if_block_creators = [create_if_block_1$1, create_if_block_2, create_if_block_3];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*nav_active*/ ctx[5] == "chat" && /*selected_user*/ ctx[2] != 0) return 0;
    		if (/*nav_active*/ ctx[5] == "tasks" && /*selected_task*/ ctx[3] != 0) return 1;
    		if (/*nav_active*/ ctx[5] == "workflows" && /*selected_workflow*/ ctx[4] != 0) return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_1(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			a0 = element("a");
    			i0 = element("i");
    			t0 = space();
    			button = element("button");
    			span = element("span");
    			t1 = space();
    			div0 = element("div");
    			ul0 = element("ul");
    			li0 = element("li");
    			a1 = element("a");
    			t2 = text("Chat");
    			i1 = element("i");
    			t3 = space();
    			li1 = element("li");
    			a2 = element("a");
    			t4 = text("Tasks");
    			i2 = element("i");
    			t5 = space();
    			li2 = element("li");
    			a3 = element("a");
    			t6 = text("Workflows");
    			i3 = element("i");
    			t7 = space();
    			li3 = element("li");
    			a4 = element("a");
    			t8 = text("files");
    			i4 = element("i");
    			t9 = space();
    			ul1 = element("ul");
    			li4 = element("li");
    			a5 = element("a");
    			i5 = element("i");
    			t10 = text("  xyz@empresa.pt");
    			t11 = space();
    			li5 = element("li");
    			a6 = element("a");
    			t12 = text("Sign out ");
    			i6 = element("i");
    			t13 = space();
    			div4 = element("div");
    			div2 = element("div");
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t14 = space();
    			div3 = element("div");
    			if (if_block) if_block.c();
    			attr_dev(i0, "class", "bi bi-house");
    			add_location(i0, file$4, 136, 36, 2928);
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "navbar-brand");
    			add_location(a0, file$4, 136, 3, 2895);
    			attr_dev(span, "class", "navbar-toggler-icon");
    			add_location(span, file$4, 138, 4, 3059);
    			attr_dev(button, "class", "navbar-toggler");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "data-toggle", "collapse");
    			attr_dev(button, "data-target", "#navbar6");
    			add_location(button, file$4, 137, 3, 2963);
    			attr_dev(i1, "class", "bi bi-arrow-right");
    			add_location(i1, file$4, 144, 39, 3342);
    			attr_dev(a1, "class", "nav-link");
    			attr_dev(a1, "href", "#");
    			add_location(a1, file$4, 144, 6, 3309);
    			attr_dev(li0, "class", "nav-item svelte-nhg1ms");
    			attr_dev(li0, "id", "chat");
    			add_location(li0, file$4, 143, 5, 3232);
    			attr_dev(i2, "class", "bi bi-arrow-right");
    			add_location(i2, file$4, 147, 42, 3511);
    			attr_dev(a2, "class", "nav-link ");
    			attr_dev(a2, "href", "#");
    			add_location(a2, file$4, 147, 6, 3475);
    			attr_dev(li1, "class", "nav-item svelte-nhg1ms");
    			attr_dev(li1, "id", "tasks");
    			add_location(li1, file$4, 146, 5, 3396);
    			attr_dev(i3, "class", "bi bi-arrow-right");
    			add_location(i3, file$4, 150, 45, 3691);
    			attr_dev(a3, "class", "nav-link ");
    			attr_dev(a3, "href", "#");
    			add_location(a3, file$4, 150, 6, 3652);
    			attr_dev(li2, "class", "nav-item svelte-nhg1ms");
    			attr_dev(li2, "id", "workflows");
    			add_location(li2, file$4, 149, 5, 3565);
    			attr_dev(i4, "class", "bi bi-arrow-right");
    			add_location(i4, file$4, 153, 41, 3859);
    			attr_dev(a4, "class", "nav-link ");
    			attr_dev(a4, "href", "#");
    			add_location(a4, file$4, 153, 6, 3824);
    			attr_dev(li3, "class", "nav-item svelte-nhg1ms");
    			attr_dev(li3, "id", "files");
    			add_location(li3, file$4, 152, 5, 3745);
    			attr_dev(ul0, "class", "navbar-nav svelte-nhg1ms");
    			add_location(ul0, file$4, 141, 4, 3197);
    			attr_dev(i5, "class", "bi bi-envelope");
    			add_location(i5, file$4, 158, 37, 4018);
    			attr_dev(a5, "class", "nav-link ");
    			attr_dev(a5, "href", "#");
    			add_location(a5, file$4, 158, 6, 3987);
    			attr_dev(li4, "class", "nav-item svelte-nhg1ms");
    			add_location(li4, file$4, 157, 5, 3959);
    			attr_dev(i6, "class", "bi bi-door-closed");
    			add_location(i6, file$4, 161, 73, 4180);
    			attr_dev(a6, "class", "nav-link");
    			add_location(a6, file$4, 161, 6, 4113);
    			attr_dev(li5, "class", "nav-item svelte-nhg1ms");
    			add_location(li5, file$4, 160, 5, 4085);
    			attr_dev(ul1, "class", "navbar-nav ml-auto svelte-nhg1ms");
    			add_location(ul1, file$4, 156, 4, 3922);
    			attr_dev(div0, "class", "navbar-collapse collapse justify-content-stretch");
    			attr_dev(div0, "id", "navbar6");
    			add_location(div0, file$4, 140, 3, 3117);
    			attr_dev(nav, "class", "navbar navbar-expand-md navbar-dark bg-primary active svelte-nhg1ms");
    			add_location(nav, file$4, 135, 2, 2824);
    			attr_dev(div1, "class", "d-flex flex-column flex-shrink-0 p-3");
    			set_style(div1, "width", "280px");
    			set_style(div1, "height", "90vh");
    			add_location(div1, file$4, 171, 4, 4359);
    			set_style(div2, "width", "280px");
    			set_style(div2, "Text-align", "left");
    			set_style(div2, "float", "left");
    			set_style(div2, "background-color", "gainsboro");
    			add_location(div2, file$4, 170, 3, 4274);
    			set_style(div3, "Text-align", "right");
    			set_style(div3, "width", "calc(100% - 280px)");
    			set_style(div3, "float", "right");
    			set_style(div3, "height", "90vh");
    			add_location(div3, file$4, 180, 3, 4707);
    			add_location(div4, file$4, 169, 2, 4265);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, a0);
    			append_dev(a0, i0);
    			append_dev(nav, t0);
    			append_dev(nav, button);
    			append_dev(button, span);
    			append_dev(nav, t1);
    			append_dev(nav, div0);
    			append_dev(div0, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, a1);
    			append_dev(a1, t2);
    			append_dev(a1, i1);
    			append_dev(ul0, t3);
    			append_dev(ul0, li1);
    			append_dev(li1, a2);
    			append_dev(a2, t4);
    			append_dev(a2, i2);
    			append_dev(ul0, t5);
    			append_dev(ul0, li2);
    			append_dev(li2, a3);
    			append_dev(a3, t6);
    			append_dev(a3, i3);
    			append_dev(ul0, t7);
    			append_dev(ul0, li3);
    			append_dev(li3, a4);
    			append_dev(a4, t8);
    			append_dev(a4, i4);
    			append_dev(div0, t9);
    			append_dev(div0, ul1);
    			append_dev(ul1, li4);
    			append_dev(li4, a5);
    			append_dev(a5, i5);
    			append_dev(a5, t10);
    			append_dev(ul1, t11);
    			append_dev(ul1, li5);
    			append_dev(li5, a6);
    			append_dev(a6, t12);
    			append_dev(a6, i6);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div2);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div4, t14);
    			append_dev(div4, div3);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div3, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(li0, "click", /*click_handler*/ ctx[8], false, false, false),
    					listen_dev(li1, "click", /*click_handler_1*/ ctx[9], false, false, false),
    					listen_dev(li2, "click", /*click_handler_2*/ ctx[10], false, false, false),
    					listen_dev(li3, "click", /*click_handler_3*/ ctx[11], false, false, false),
    					listen_dev(a6, "click", /*click_handler_4*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selected, options*/ 130) {
    				each_value = /*options*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(div3, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(div4);
    			destroy_each(each_blocks, detaching);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(135:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (133:1) {#if _logged === false}
    function create_if_block$3(ctx) {
    	let login;
    	let current;
    	login = new Login({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(login.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(login, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(login.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(login.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(login, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(133:1) {#if _logged === false}",
    		ctx
    	});

    	return block;
    }

    // (173:5) {#each options as option , index}
    function create_each_block$2(ctx) {
    	let div2;
    	let div1;
    	let t0_value = /*option*/ ctx[16].name + "";
    	let t0;
    	let t1;
    	let div0;
    	let t2;
    	let mounted;
    	let dispose;

    	function click_handler_5() {
    		return /*click_handler_5*/ ctx[13](/*index*/ ctx[18]);
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			attr_dev(div0, "class", "circle svelte-nhg1ms");
    			set_style(div0, "background-color", /*option*/ ctx[16].color);
    			add_location(div0, file$4, 174, 49, 4578);
    			attr_dev(div1, "class", "sidebar-content svelte-nhg1ms");
    			add_location(div1, file$4, 174, 6, 4535);
    			add_location(div2, file$4, 173, 5, 4488);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div2, t2);

    			if (!mounted) {
    				dispose = listen_dev(div2, "click", click_handler_5, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*options*/ 2 && t0_value !== (t0_value = /*option*/ ctx[16].name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*options*/ 2) {
    				set_style(div0, "background-color", /*option*/ ctx[16].color);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(173:5) {#each options as option , index}",
    		ctx
    	});

    	return block;
    }

    // (193:66) 
    function create_if_block_3(ctx) {
    	let workflow;
    	let current;

    	workflow = new Workflow({
    			props: { workflowid: /*selected_workflow*/ ctx[4] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(workflow.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(workflow, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const workflow_changes = {};
    			if (dirty & /*selected_workflow*/ 16) workflow_changes.workflowid = /*selected_workflow*/ ctx[4];
    			workflow.$set(workflow_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(workflow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(workflow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(workflow, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(193:66) ",
    		ctx
    	});

    	return block;
    }

    // (187:58) 
    function create_if_block_2(ctx) {
    	let tasks;
    	let current;

    	tasks = new Tasks({
    			props: { taskid: /*selected_task*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tasks.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tasks, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tasks_changes = {};
    			if (dirty & /*selected_task*/ 8) tasks_changes.taskid = /*selected_task*/ ctx[3];
    			tasks.$set(tasks_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tasks.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tasks.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tasks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(187:58) ",
    		ctx
    	});

    	return block;
    }

    // (182:4) {#if nav_active == "chat" && selected_user != 0}
    function create_if_block_1$1(ctx) {
    	let chat;
    	let current;

    	chat = new Chat({
    			props: { userid: /*selected_user*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(chat.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(chat, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const chat_changes = {};
    			if (dirty & /*selected_user*/ 4) chat_changes.userid = /*selected_user*/ ctx[2];
    			chat.$set(chat_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(chat.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(chat.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(chat, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(182:4) {#if nav_active == \\\"chat\\\" && selected_user != 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let link0;
    	let link1;
    	let t;
    	let main;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*_logged*/ ctx[0] === false) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			link0 = element("link");
    			link1 = element("link");
    			t = space();
    			main = element("main");
    			if_block.c();
    			attr_dev(link0, "rel", "stylesheet");
    			attr_dev(link0, "href", "https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/css/bootstrap.min.css");
    			attr_dev(link0, "integrity", "sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh");
    			attr_dev(link0, "crossorigin", "anonymous");
    			add_location(link0, file$4, 126, 1, 2428);
    			attr_dev(link1, "rel", "stylesheet");
    			attr_dev(link1, "href", "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.3.0/font/bootstrap-icons.css");
    			add_location(link1, file$4, 127, 1, 2640);
    			attr_dev(main, "class", "svelte-nhg1ms");
    			add_location(main, file$4, 131, 0, 2764);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document_1.head, link0);
    			append_dev(document_1.head, link1);
    			insert_dev(target, t, anchor);
    			insert_dev(target, main, anchor);
    			if_blocks[current_block_type_index].m(main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(main, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link0);
    			detach_dev(link1);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(main);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let _logged;

    	logged.subscribe(value => {
    		$$invalidate(0, _logged = value);
    	});

    	let options = [];
    	let selected_user = 0;
    	let selected_task = 0;
    	let selected_workflow = 0;
    	let nav_active = "chat";

    	function updateSideBar(type) {
    		document.getElementById(nav_active).classList.remove("active");
    		document.getElementById(type).classList.add("active");
    		$$invalidate(5, nav_active = type);
    		getOptions(type);

    		switch (type) {
    			case 'chat':
    				$$invalidate(2, selected_user = 0);
    				break;
    			case 'tasks':
    				$$invalidate(3, selected_task = 0);
    				break;
    			case 'workflows':
    				$$invalidate(4, selected_workflow = 0);
    				break;
    		}
    	}

    	function selected(index) {
    		switch (nav_active) {
    			case 'chat':
    				$$invalidate(2, selected_user = options[index]["id"]);
    				break;
    			case 'tasks':
    				$$invalidate(3, selected_task = options[index]["id"]);
    				break;
    			case 'workflows':
    				$$invalidate(4, selected_workflow = options[index]["id"]);
    		}
    	}

    	function decodeColor() {
    		for (let i = 0; i < options.length; i++) {
    			switch (nav_active) {
    				case 'chat':
    					if (options[i]["status"] == "offline") {
    						$$invalidate(1, options[i]["color"] = "grey", options);
    						delete options[i].status;
    					}
    					if (options[i]["status"] == "online") {
    						$$invalidate(1, options[i]["color"] = "green", options);
    						delete options[i].status;
    					}
    					if (options[i]["status"] == "busy") {
    						$$invalidate(1, options[i]["color"] = "red", options);
    						delete options[i].status;
    					}
    					break;
    			}
    		}

    		console.log(options);
    		$$invalidate(1, options);
    	}

    	function getOptions(type) {
    		$$invalidate(1, options = []); //send http request in order to get list of options (tasks, workflows , etc...)

    		switch (type) {
    			case 'chat':
    				$$invalidate(1, options = [
    					{
    						"name": 'Jonh Doe',
    						"status": 'offline',
    						'id': 0xff
    					},
    					{
    						"name": 'Jane Doe',
    						"status": 'online',
    						"id": 0xf1
    					},
    					{
    						"name": 'User3',
    						'status': "busy",
    						"id": 0xf3
    					}
    				]);
    				decodeColor();
    				break;
    			case 'tasks':
    				$$invalidate(1, options = [
    					{ name: 'Tarefa 1', color: 'red', 'id': 1 },
    					{
    						name: 'Tarefa 2',
    						color: 'green',
    						'id': 2
    					}
    				]);
    				break;
    			case 'workflows':
    				$$invalidate(1, options = [
    					{
    						name: 'Workflow 1',
    						'id': 1,
    						color: 'red'
    					},
    					{
    						name: 'Workflow 2',
    						'id': 2,
    						color: 'green'
    					}
    				]);
    				break;
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$3.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => updateSideBar('chat');
    	const click_handler_1 = () => updateSideBar('tasks');
    	const click_handler_2 = () => updateSideBar('workflows');
    	const click_handler_3 = () => updateSideBar('files');

    	const click_handler_4 = () => {
    		logged.set(false);
    	};

    	const click_handler_5 = index => {
    		selected(index);
    	};

    	$$self.$capture_state = () => ({
    		Chat,
    		userid: Chat,
    		taskid: Tasks,
    		Tasks,
    		Login,
    		Workflow,
    		logged,
    		get: get_store_value,
    		_logged,
    		options,
    		selected_user,
    		selected_task,
    		selected_workflow,
    		nav_active,
    		updateSideBar,
    		selected,
    		decodeColor,
    		getOptions
    	});

    	$$self.$inject_state = $$props => {
    		if ('_logged' in $$props) $$invalidate(0, _logged = $$props._logged);
    		if ('options' in $$props) $$invalidate(1, options = $$props.options);
    		if ('selected_user' in $$props) $$invalidate(2, selected_user = $$props.selected_user);
    		if ('selected_task' in $$props) $$invalidate(3, selected_task = $$props.selected_task);
    		if ('selected_workflow' in $$props) $$invalidate(4, selected_workflow = $$props.selected_workflow);
    		if ('nav_active' in $$props) $$invalidate(5, nav_active = $$props.nav_active);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		_logged,
    		options,
    		selected_user,
    		selected_task,
    		selected_workflow,
    		nav_active,
    		updateSideBar,
    		selected,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
