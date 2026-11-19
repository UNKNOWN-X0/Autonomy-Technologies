/* APDR Chapter 10: visual traces of object state and method dispatch. */
(function () {
  var ids = ["abstraction", "instances", "methods", "repr", "special", "fraction"];
  var refs = {abstraction:"10.1",instances:"10.2",methods:"10.4",repr:"10.5",special:"10.6",fraction:"10.7"};
  var content = {
    abstraction:[
      ["Data and interface","An object groups which two ideas?","Representation and interface","Code can use the interface without knowing the storage.","Only its class name","Its source file and output"],
      ["List access","Which uses the list interface?","L.append(4)","The method asks the list to update itself.","Change assumed internal cells","Edit the interpreter"],
      ["Hide representation","Why keep list storage private?","So implementation can change behind the interface","Users depend on behaviour, not storage layout.","So methods are unnecessary","So values cannot change"],
      ["Object type","A value 123 is an instance of which type?","int","The value is an object whose type is int.","Coordinate","list"]
    ],
    instances:[
      ["Class or object","In Coordinate(3, 4), what is Coordinate?","The class","Calling the class constructs an instance.","The instance","An attribute"],
      ["Two instances","Do c and origin have separate x values?","Yes, each stores its own attributes","Instance attributes belong to each object.","No, all coordinates share x","Only if their y values match"],
      ["Initialiser","Who supplies self in Coordinate(3, 4)?","Python supplies the new instance","The caller supplies x and y; Python binds self.","The caller must pass self first","The class name is self"],
      ["Store an attribute","What does self.x = x do?","Stores x on this instance","The left side names the object attribute.","Changes every Coordinate","Creates a class method"]
    ],
    methods:[
      ["Bound self","In c.distance(origin), what is self?","c","The instance before the dot is bound to self.","origin","Coordinate"],
      ["Other argument","In c.distance(origin), what is other?","origin","The explicit argument fills the second parameter.","c","The distance result"],
      ["Expanded call","Which call is equivalent?","Coordinate.distance(c, origin)","The instance becomes the first class-method argument.","Coordinate.distance(origin, c)","distance(Coordinate, c)"],
      ["Distance","From (3,4) to (0,0), what is the distance?","5","The square root of 3 squared plus 4 squared is 5.","7","25"]
    ],
    repr:[
      ["Print hook","Which method does print(c) use for a custom string?","__str__","It provides the printable string form.","__init__","__len__"],
      ["Return type","What must __str__ return?","A string","Python needs text to display.","A tuple","Nothing; it must print itself"],
      ["Coordinate text","For x=3, y=4, what can __str__ return?","<3,4>","The method builds and returns this string.","(3,4) as a tuple","None"],
      ["Default display","Without __str__, what is likely printed?","A technical default object representation","Python uses the default representation.","Always <x,y>","The class source code"]
    ],
    special:[
      ["Addition","Which method corresponds to a + b?","__add__","Addition syntax invokes the class’s addition behaviour.","__eq__","__str__"],
      ["Equality","Which method corresponds to a == b?","__eq__","Equality uses the rich-comparison method.","__lt__","__add__"],
      ["Length","Which method supports len(obj)?","__len__","The method supplies the object’s length.","__str__","__init__"],
      ["Meaningful operation","When should a class define an operator method?","When the operation has a clear meaning for that type","A familiar symbol should keep a sensible contract.","Whenever possible","Only to avoid writing methods"]
    ],
    fraction:[
      ["Representation","What data represents a fraction?","Numerator and denominator","These two integers define the quotient.","Only a decimal","A list of digits"],
      ["Addition","What is 1/2 + 1/3?","5/6","Use common denominator 6: 3/6 + 2/6.","2/5","2/6"],
      ["Inversion","What is the inverse of 3/5?","5/3","Swap numerator and denominator when numerator is non-zero.","-3/5","3/5"],
      ["Invalid denominator","What should construction with denominator zero do?","Reject it with a defined error","A zero denominator does not represent a finite fraction.","Silently change it to one","Return an unrelated fraction"]
    ]
  };
  function mount(id) {
    var section=document.querySelector('[data-experiment="'+id+'"]');
    var form=section.querySelector("form"),canvas=section.querySelector("canvas"),msg=form.querySelector("[data-own-msg]"),state={rows:[],progress:1,result:""};
    function paint(){var ctx=canvas.getContext("2d"),w=canvas.width=Math.max(320,canvas.clientWidth||600),h=canvas.height=Math.max(240,canvas.clientHeight||320),css=getComputedStyle(document.body);ctx.fillStyle=css.getPropertyValue("--paper").trim()||"#fff";ctx.fillRect(0,0,w,h);ctx.font="600 14px ui-monospace, monospace";ctx.fillStyle=css.getPropertyValue("--ink").trim()||"#10243d";state.rows.slice(0,Math.max(1,Math.ceil(state.rows.length*state.progress))).forEach(function(row,i){ctx.fillText(row,18,32+i*30,w-36);});if(state.result){ctx.font="700 15px sans-serif";ctx.fillStyle=css.getPropertyValue("--act").trim()||"#04316a";ctx.fillText(state.result,18,h-24,w-36);}}
    function challenge(row,i){var choices=[[row[2],row[2]],[row[4],row[4]],[row[5],row[5]]],shift=i%3;choices=choices.slice(shift).concat(choices.slice(0,shift));return{id:id+"-"+(i+1),short:row[0],ref:refs[id],prompt:row[1],answer:row[2],options:choices,why:"<p>"+row[3].replace(/&/g,"&amp;").replace(/</g,"&lt;")+"</p>",stage:function(){state.rows=["Question: "+row[1],"Trace: "+row[3]];state.progress=0;state.result="Result: "+row[2];paint();},preview:function(){},reveal:function(){return Lab.tween(650,function(t){state.progress=t;paint();});}};}
    var challenges=content[id].map(challenge);
    Lab.experiment({id:id,title:section.querySelector("h2").textContent,card:section.querySelector(".challenge"),challenges:challenges,setup:function(c){c.stage();},sandbox:function(){var value=form.querySelector("[data-f]").value.trim();state.rows=["Explore: "+(value||"enter an example"),"Identify the object, its state, and the operation."];state.progress=1;state.result="Trace the call";if(msg)msg.textContent=value?"":"Enter a short example.";paint();},lock:function(on){form.querySelectorAll("input,select,button").forEach(function(el){el.disabled=on;});}});
    form.addEventListener("input",function(){if(!section.querySelector(".challenge .ch-go")){var value=form.querySelector("[data-f]").value.trim();state.rows=["Explore: "+(value||"enter an example"),"Identify the object, its state, and the operation."];state.progress=1;state.result="Trace the call";if(msg)msg.textContent=value?"":"Enter a short example.";paint();}});
    state.rows=["Choose an answer, then reveal the reasoning."];paint();
  }
  ids.forEach(mount);
})();
