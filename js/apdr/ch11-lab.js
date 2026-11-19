/* APDR Chapter 11: visual traces of accessors, inheritance and Rabbit behaviour. */
(function () {
  var ids = ["animal", "accessors", "lookup", "constructors", "classvar", "rabbits"];
  var refs = {animal:"11.3",accessors:"11.2",lookup:"11.4",constructors:"11.5",classvar:"11.6",rabbits:"11.7"};
  var content = {
    animal:[
      ["Class or instance","In Animal(3), what is Animal?","The class","Calling it creates one Animal instance.","The age value","The getter"],
      ["Initial name","What value does the lecture assign to name in __init__?","None","Name has no value until a setter supplies one.","An empty string","The age"],
      ["Omitted name","What does set_name() store when the default is an empty string?","The empty string","The default applies because the caller omitted newname.","None","It raises TypeError"],
      ["Supplied name","What does set_name('Fluffy') store?","Fluffy","An actual argument replaces the default.","The empty string","None"]
    ],
    accessors:[
      ["Getter purpose","What does get_age() provide?","The stored age through a method","Callers use the public method rather than depend on a field name.","A new age","The class name"],
      ["Renamed field","Animal changes age to years. What should a.get_age() do?","Return self.years","The interface stays the same while the representation changes.","Fail because age is gone","Return the class variable"],
      ["Python privacy","Can a caller still write a.age = 9?","Yes; Python permits direct attribute writes","Accessors are a style interface, not enforced privacy.","No, getters lock the field","Only subclasses can write it"],
      ["Stable caller","What should outside code prefer?","a.get_age()","It remains stable if the stored field is renamed.","a.years","Animal.age"]
    ],
    lookup:[
      ["Start lookup","Where does lookup start for a Shepherd object?","Shepherd","Python checks the instance’s own class first.","Animal always","The base object class first"],
      ["Inherited getter","Shepherd and Dog do not define get_age. Where is it found?","Animal","Search continues up the superclass chain.","It is unavailable","Only in the instance dictionary"],
      ["Subclass-only method","Can Animal call Cat.speak?","No","Animal’s lookup does not search down into subclasses.","Yes, every subclass method is inherited downward","Only after constructing a Cat"],
      ["First match","If Dog and Animal both define __str__, which runs for Dog?","Dog’s version","Lookup stops at the first matching definition.","Animal’s version always","Both versions automatically run"]
    ],
    constructors:[
      ["Parent state","What does Dog call to initialise its Animal part?","Animal.__init__(self, age)","The parent initialiser stores inherited state.","Animal.get_age(self)","Dog.__str__(self)"],
      ["Own state","When should Dog create its friends list?","After calling Animal’s initialiser","It then adds the subclass-specific attribute.","Before class definition","Only when add_friend runs"],
      ["Shepherd chain","If Shepherd calls Dog.__init__, what can Dog initialise?","Its own fields and Animal’s through its parent call","The call chain can initialise each level.","Only Shepherd.skill","No data attributes"],
      ["Override","If Shepherd defines speak, which speak does its instance use?","Shepherd’s","It is the first definition in the lookup chain.","Animal’s","Both are called automatically"]
    ],
    classvar:[
      ["Shared value","Where is Rabbit.tag = 1 stored?","On the Rabbit class","Instances share the class variable until shadowed.","Separately in every new Rabbit","In Animal only"],
      ["First ID","With tag initially 1, what ID does the first Rabbit store?","1","It copies the shared current tag before incrementing it.","0","2"],
      ["Next tag","After the first rabbit stores ID 1, what is Rabbit.tag?","2","The class counter advances once.","1","The first rabbit’s rid becomes 2"],
      ["Formatted ID","What can str(3).zfill(3) return?","003","The method pads the string to width three.","300","3.00"]
    ],
    rabbits:[
      ["Addition method","Which special method implements r1 + r2?","__add__","The method defines addition for this class.","__eq__","__str__"],
      ["Addition result","What does the lecture’s Rabbit.__add__ create?","A new age-0 Rabbit with the operands as parents","The constructor stores both parent references.","The larger parent","A Boolean"],
      ["Parent order","Should equal-parent rabbits match when parent order is reversed?","Yes, the rule checks both pairings","The same two parents can appear in either order.","No, order must always match","Only if ages match"],
      ["Missing parent","What happens if equality reads .rid on a None parent?","AttributeError","None has no rid attribute; guard the optional case.","It returns True","Python treats None as ID zero"]
    ]
  };
  function mount(id) {
    var section=document.querySelector('[data-experiment="'+id+'"]');
    var form=section.querySelector("form"),canvas=section.querySelector("canvas"),msg=form.querySelector("[data-own-msg]"),state={rows:[],progress:1,result:""};
    function paint(){var ctx=canvas.getContext("2d"),w=canvas.width=Math.max(320,canvas.clientWidth||600),h=canvas.height=Math.max(240,canvas.clientHeight||320),css=getComputedStyle(document.body);ctx.fillStyle=css.getPropertyValue("--paper").trim()||"#fff";ctx.fillRect(0,0,w,h);ctx.font="600 14px ui-monospace, monospace";ctx.fillStyle=css.getPropertyValue("--ink").trim()||"#10243d";state.rows.slice(0,Math.max(1,Math.ceil(state.rows.length*state.progress))).forEach(function(row,i){ctx.fillText(row,18,32+i*30,w-36);});if(state.result){ctx.font="700 15px sans-serif";ctx.fillStyle=css.getPropertyValue("--act").trim()||"#04316a";ctx.fillText(state.result,18,h-24,w-36);}}
    function challenge(row,i){var choices=[[row[2],row[2]],[row[4],row[4]],[row[5],row[5]]],shift=i%3;choices=choices.slice(shift).concat(choices.slice(0,shift));return{id:id+"-"+(i+1),short:row[0],ref:refs[id],prompt:row[1],answer:row[2],options:choices,why:"<p>"+row[3].replace(/&/g,"&amp;").replace(/</g,"&lt;")+"</p>",stage:function(){state.rows=["Question: "+row[1],"Trace: "+row[3]];state.progress=0;state.result="Result: "+row[2];paint();},preview:function(){},reveal:function(){return Lab.tween(650,function(t){state.progress=t;paint();});}};}
    var challenges=content[id].map(challenge);
    Lab.experiment({id:id,title:section.querySelector("h2").textContent,card:section.querySelector(".challenge"),challenges:challenges,setup:function(c){c.stage();},sandbox:function(){var value=form.querySelector("[data-f]").value.trim();state.rows=["Explore: "+(value||"enter an example"),"Trace the class chain, instance data, and selected method."];state.progress=1;state.result="Follow the first matching definition";if(msg)msg.textContent=value?"":"Enter a short example.";paint();},lock:function(on){form.querySelectorAll("input,select,button").forEach(function(el){el.disabled=on;});}});
    form.addEventListener("input",function(){if(!section.querySelector(".challenge .ch-go")){var value=form.querySelector("[data-f]").value.trim();state.rows=["Explore: "+(value||"enter an example"),"Trace the class chain, instance data, and selected method."];state.progress=1;state.result="Follow the first matching definition";if(msg)msg.textContent=value?"":"Enter a short example.";paint();}});
    state.rows=["Choose an answer, then reveal the reasoning."];paint();
  }
  ids.forEach(mount);
})();
