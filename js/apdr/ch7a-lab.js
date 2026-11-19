/* APDR Chapter 7a lab: runtime concepts, ownership, compilation, and recursion. */
(function () {
  var C = APDR7A;
  function spec(id, short, ref, prompt, answer, wrongA, wrongB, steps, why) {
    var opts=[[answer,answer],[wrongA,wrongA],[wrongB,wrongB]], shift=id.split("").reduce(function(n,c){return n+c.charCodeAt(0);},0)%3; opts=opts.slice(shift).concat(opts.slice(0,shift)); return { id:id, short:short, ref:ref, prompt:prompt, answer:answer, options:opts, steps:steps, why:"<p>"+why+"</p>" };
  }
  function mount(id,title,challenges,sandbox) {
    var section=document.querySelector('[data-experiment="'+id+'"]'), form=section.querySelector("form"), canvas=section.querySelector("canvas"), msg=form.querySelector("[data-own-msg]"), state={rows:[],progress:1,result:""};
    function paint() {
      var ctx=canvas.getContext("2d"), w=canvas.width=Math.max(320,canvas.clientWidth||640), h=canvas.height=Math.max(240,canvas.clientHeight||320), style=getComputedStyle(document.body);
      ctx.clearRect(0,0,w,h); ctx.fillStyle=style.getPropertyValue("--paper").trim()||"#fff"; ctx.fillRect(0,0,w,h); ctx.fillStyle=style.getPropertyValue("--ink").trim()||"#10243d"; ctx.font="600 13px ui-monospace, monospace";
      state.rows.slice(0,Math.max(1,Math.ceil(state.rows.length*state.progress))).forEach(function(line,i){ctx.fillText(String(line).slice(0,76),18,30+i*20);});
      if(state.result){ctx.fillStyle=style.getPropertyValue("--act").trim()||"#04316a";ctx.font="700 13px sans-serif";ctx.fillText(state.result,18,h-20);}
    }
    function build(s){return {id:s.id,short:s.short,ref:s.ref,prompt:s.prompt,options:s.options,answer:s.answer,why:s.why,stage:function(){state.rows=s.steps;state.progress=0;state.result="Answer: "+s.answer;paint();},preview:paint,reveal:function(){return Lab.tween(900,function(t){state.progress=t;paint();});}};}
    function live(){try{state.rows=sandbox(form);state.result="Explore freely";if(msg)msg.textContent="";}catch(e){state.rows=[];state.result="";if(msg)msg.textContent=e.message;}state.progress=1;paint();}
    Lab.experiment({id:id,title:title,card:section.querySelector(".challenge"),lock:function(on){form.querySelectorAll("input,select,textarea,button").forEach(function(x){x.disabled=on;});},setup:function(c){c.stage();},sandbox:live,challenges:challenges.map(build)});
    form.addEventListener("input",live);form.addEventListener("change",live);
    if(typeof ResizeObserver!=="undefined"){var ro=new ResizeObserver(paint);ro.observe(canvas.parentElement);} live();
  }
  function val(form,key){return form.querySelector('[data-f="'+key+'"]').value;}
  var memory=[
    spec("mem-alias","alias mutation","7.1","After b = a and b.append(2), which names show the changed list?","a and b","only a","only b",C.memory("alias"),"Assignment binds b to the same mutable list; mutation is visible through both names."),
    spec("mem-copy","shallow copy","7.1","After b = a.copy(), are the outer lists the same object?","No","Yes","Only if their contents match",C.memory("copy"),"A shallow copy makes a new outer list, even when its contents compare equal."),
    spec("mem-rebind","rebind","7.1","After b = a then b = [9], what happens to a?","a still refers to its original list","a is rebound to [9]","Both names are deleted",C.memory("rebind"),"Rebinding one name does not change the object referenced by another name."),
    spec("mem-stack","storage model","7.1","Does C++ require every local variable to occupy a hardware stack slot?","No","Yes, always","Only pointer variables",["Source languages define behavior, not a required physical stack layout","Compilers may keep values in registers or optimize storage away"],"Stack and heap are useful implementation pictures, not a portable placement guarantee.")
  ];
  mount("memory","Names and objects",memory,function(f){return C.memory(val(f,"action"));});
  var types=[
    spec("type-static","static check","7.2","When does C++ normally reject assigning a string literal to an int?","Before execution","Only when the line runs","Only after program exit",C.classify("static"),"C++ is statically typed; ordinary type checking happens at compile time."),
    spec("type-forms","templates","7.2","A C++ function template is which form of polymorphism?","Parametric","Ad-hoc","Subtype",C.classify("forms"),"One generic definition is parameterized by a type."),
    spec("type-subtype","virtual dispatch","7.2","A derived object called through a virtual base method uses which form?","Subtype","Ad-hoc","Parametric",C.classify("forms"),"A derived value is used through a base interface with runtime dispatch."),
    spec("type-duck","duck typing","7.2","For Python duck typing, must Dog inherit from Animal to call speak()?","No","Yes, always","Only for built-in classes",C.classify("duck"),"The call works when the object supports the requested operation.")
  ];
  mount("types","Type checks and polymorphism",types,function(f){return C.classify(val(f,"concept"));});
  var abstraction=[
    spec("abs-private","C++ access","7.3","What is the default member access in a C++ class?","private","public","protected",C.abstraction("private"),"A C++ class defaults to private member access; a struct defaults to public."),
    spec("abs-mangle","Python name","7.3","What does a double-leading-underscore class attribute do?","Name mangling reduces accidental clashes","It becomes inaccessible to all code","It is exported by __all__",C.abstraction("mangling"),"Name mangling is not an access-control or security boundary."),
    spec("abs-all","wildcard import","7.3","What does __all__ control?","Names imported by from module import *","All names accessible on the module","Private C++ symbols",C.abstraction("all"),"__all__ controls wildcard imports, not direct access."),
    spec("abs-contract","abstraction","7.3","What should a caller rely on?","The documented interface contract","Every private field","The current memory layout",["A contract describes observable behavior","Implementation details can then change","Tests can focus on the public promise"],"Abstraction keeps callers dependent on behavior rather than representation.")
  ];
  mount("abstraction","Abstraction and visibility",abstraction,function(f){return C.abstraction(val(f,"rule"));});
  var lifetime=[
    spec("life-raii","RAII","7.4","When does an RAII-owned file close on exception exit?","When its owner is destroyed","Only at process exit","Only after an explicit free()",C.lifetime("raii"),"C++ destroys the automatic owner during exception unwinding; its destructor releases the file."),
    spec("life-cycle","shared cycle","7.4","Why does a shared_ptr ownership cycle remain allocated?","Each reference count stays positive","The objects are on the stack","weak_ptr increases the count",C.lifetime("cycle"),"Use weak_ptr for a non-owning edge when shared ownership would cycle."),
    spec("life-gc","Python cycle","7.4","Can CPython reclaim an unreachable cycle of objects?","Yes, its cyclic collector can","No, reference counts forbid it","Only if each object calls free()",C.lifetime("gc"),"CPython supplements reference counting with a cyclic garbage collector."),
    spec("life-file","Python resource","7.4","What is the reliable way to close a Python file after a block?","Use a with context manager","Wait for garbage collection","Set the variable to None",["with open(...) as f opens the resource","The block exits","The context manager closes the file"],"Garbage collection is not a deterministic resource-management policy.")
  ];
  mount("lifetime","Ownership and resource lifetime",lifetime,function(f){return C.lifetime(val(f,"resource"));});
  var compiler=[
    spec("compile-order","compiler order","7.5","Which stage normally turns parsed source into an intermediate representation?","IR generation","Linking","Lexing",C.compiler("pipeline"),"IR generation follows parsing and semantic checks in a typical pipeline."),
    spec("compile-phi","SSA merge","7.5","What does φ(x2, x3) represent at a control-flow join?","The incoming value from the branch taken","The sum x2 + x3","A new machine instruction",C.compiler("phi"),"The φ-function selects a value based on which predecessor path reached the join."),
    spec("compile-python","CPython","7.5","What does a .pyc file cache?","Python bytecode","Native machine code","A source-level AST only",C.compiler("python"),"CPython bytecode is executed by the Python virtual machine."),
    spec("compile-jit","JIT","7.5","When does a JIT compile a hot path?","During program execution","Only before source is written","After linking has ended",["Runtime observes frequently executed code","A JIT compiles a hot path","The generated machine code runs for later iterations"],"Just-in-time compilation happens during execution.")
  ];
  mount("compiler","Compilation and SSA",compiler,function(f){return C.compiler(val(f,"question"));});
  var recursion=[
    spec("rec-factorial","factorial trace","7.6","How many calls, including fact(0), occur in fact(4)?","5","4","6",C.factorial(4),"The argument decreases 4, 3, 2, 1, 0; the base call is included."),
    spec("rec-measure","measure","7.6","What measure proves factorial terminates for n ≥ 0?","n decreases to 0","The result gets larger","The call stack gets taller",C.factorial(3),"A non-negative integer cannot decrease forever."),
    spec("rec-induction","induction","7.7","To prove P(k+1) by weak induction, what do you assume?","P(k)","P(k+1)","P(0) for every k",["Base case: establish P(1)","Induction step: assume P(k)","Use it to prove P(k+1)"],"The induction hypothesis is the smaller case, not the conclusion being proved."),
    spec("rec-tail","tail calls","7.7","Does Python reuse the current frame for a tail-recursive call?","No","Yes, always","Only when using an accumulator",["The recursive call is last","Python still retains the current frame","Deep recursion can reach the recursion limit"],"Python does not perform tail-call optimization.")
  ];
  mount("recursion","Recursion and induction",recursion,function(f){return C.factorial(val(f,"n"));});
})();
