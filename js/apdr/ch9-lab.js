/* APDR Chapter 9: visual traces for test design and error handling. */
(function () {
  var experimentIds = ["contract", "blackbox", "glassbox", "debug", "exceptions", "assertions"];
  var content = {
    contract: [
      ["Contract first","Before testing is_bigger(x,y), what should be written?","Inputs and promised result","A contract says what inputs are assumed and what result is promised."],
      ["Unit test","Which test checks one small function?","Unit test","A unit test isolates one function or component."],
      ["Regression","A fixed bug appears again after editing. Which test was missing?","Regression test","Keep a test for each fixed bug and rerun it after changes."],
      ["Integration","Two tested functions work alone but the report is wrong. What next?","Integration test","Integration checks how components combine and pass values."]
    ],
    blackbox: [
      ["Zero boundary","For sqrt(x, eps), with x ≥ 0, which case checks the lower x boundary?","x = 0","Zero is a valid boundary in this contract."],
      ["Perfect square","Which case checks a known exact root?","sqrt(25)","A perfect square provides a predictable result."],
      ["Irrational root","Which input checks approximation tolerance?","sqrt(2)","Check the promised squared-result interval rather than exact equality."],
      ["Excluded epsilon","The contract says eps > 0. Which value is invalid?","eps = 0","Zero is the excluded boundary."]
    ],
    glassbox: [
      ["False branch","For if x < -1, which input takes the false branch?","x = 2","Two does not satisfy x < -1."],
      ["True branch","For if x < -1, which input takes the true branch?","x = -2","Minus two satisfies the condition."],
      ["Boundary defect","The function is absolute value with if x < -1. Which test reveals the defect?","x = -1","It returns -1, but the contract requires 1."],
      ["Coverage limit","Both branches ran. What is still needed?","Specification boundary tests","Path coverage does not guarantee correct boundary behavior."]
    ],
    debug: [
      ["Minimal input","A long input fails. What should you find first?","Smallest input that still fails","A minimal reproducer removes unrelated behavior."],
      ["Bisection","A value becomes wrong somewhere in 100 steps. Where inspect first?","Around the midpoint","Then focus on the half containing the first divergence."],
      ["Hypothesis","What should a debugging change test?","One explanation at a time","A controlled experiment makes cause and effect clearer."],
      ["Regression","After a fix, what should be rerun?","The failing case and previous tests","Confirm the fix and catch collateral regressions."]
    ],
    exceptions: [
      ["Bad conversion","int('cat') raises which exception?","ValueError","The type is acceptable but the value is not an integer literal."],
      ["Wrong operation type","'3' / 4 raises which exception?","TypeError","The operation is not defined for those operand types."],
      ["Index outside list","items[4] for a three-element list raises?","IndexError","The index lies outside the valid range."],
      ["Cleanup","Which clause runs on success or failure?","finally","Use finally for cleanup that must happen on either path."]
    ],
    assertions: [
      ["Internal invariant","A count should never be negative inside an algorithm. What check fits?","assert count >= 0","An assertion documents an internal assumption."],
      ["User input","A web form receives invalid age data. What should validate it?","Explicit input validation","Required behavior must not depend on assertions."],
      ["Optimization","What may Python do to assert under -O?","Remove the assertion","Assertions are not a runtime validation boundary."],
      ["Purpose","What does a false assertion raise in a normal run?","AssertionError","It stops near the violated internal assumption."]
    ]
  };
  var explanations={"Contract first":"A specification gives the test its expected result.","Unit test":"One small unit isolates the behavior being checked.","Regression":"A retained test detects a fixed defect if it returns.","Integration":"Components can fail when they exchange or combine data.","Zero boundary":"Zero is allowed by the stated x domain.","Perfect square":"A known exact root makes a useful expected result.","Irrational root":"Tolerance checks approximation without requiring exact equality.","Excluded epsilon":"The contract requires a strictly positive epsilon.","False branch":"Two does not satisfy the condition x < -1.","True branch":"Minus two satisfies the condition x < -1.","Boundary defect":"At minus one the faulty condition returns the input unchanged.","Coverage limit":"Execution coverage cannot replace specification-based cases.","Minimal input":"The smallest reproducer removes unrelated behavior.","Bisection":"The midpoint separates earlier and later computation.","Hypothesis":"One change at a time lets evidence distinguish causes.","Regression":"Retesting the fix case checks it; old tests catch collateral damage.","Bad conversion":"The string is not a valid integer value.","Wrong operation type":"Division is not defined for these operand types.","Index outside list":"Index four lies outside a three-element list.","Cleanup":"Finally executes on either success or failure.","Internal invariant":"Assertions are for programmer assumptions inside the algorithm.","User input":"External data needs explicit validation and a defined response.","Optimization":"Python may omit assert statements under -O.","Purpose":"A failed assertion raises AssertionError in normal execution."};
  function mount(id) {
    var section=document.querySelector('[data-experiment="'+id+'"]');
    var form=section.querySelector("form"), canvas=section.querySelector("canvas"), msg=form.querySelector("[data-own-msg]");
    var state={rows:[],progress:1,result:""};
    function paint() {
      var ctx=canvas.getContext("2d"),w=canvas.width=Math.max(320,canvas.clientWidth||600),h=canvas.height=Math.max(240,canvas.clientHeight||320);
      var css=getComputedStyle(document.body);ctx.fillStyle=css.getPropertyValue("--paper").trim()||"#fff";ctx.fillRect(0,0,w,h);
      var shown=Math.max(1,Math.ceil(state.rows.length*state.progress));
      ctx.font="600 14px ui-monospace, monospace";ctx.fillStyle=css.getPropertyValue("--ink").trim()||"#10243d";
      state.rows.slice(0,shown).forEach(function(x,i){ctx.fillText(x,18,32+i*30,w-36);});
      if(state.result){ctx.font="700 15px sans-serif";ctx.fillStyle=css.getPropertyValue("--act").trim()||"#04316a";ctx.fillText(state.result,18,h-24,w-36);}
    }
    function make(row,i) {
      var answer=row[2], wrong1=row[3]||"Random testing", wrong2=row[4]||"No tests needed";
      var refs={contract:"9.2",blackbox:"9.3",glassbox:"9.4",debug:"9.5",exceptions:"9.6",assertions:"9.8"};
      var choices=[[answer,answer],[wrong1,wrong1],[wrong2,wrong2]]; choices=choices.slice(i%3).concat(choices.slice(0,i%3));
      return {id:id+"-"+(i+1),short:row[0],ref:refs[id],prompt:row[1],answer:answer,options:choices,why:"<p>"+explanations[row[0]]+"</p>",stage:function(){state.rows=["Question: "+row[1],"Reason: "+explanations[row[0]]];state.progress=0;state.result="Answer: "+answer;paint();},preview:function(){},reveal:function(){return Lab.tween(700,function(t){state.progress=t;paint();});}};
    }
    var challenges=content[id].map(make);
    Lab.experiment({id:id,title:section.querySelector("h2").textContent,card:section.querySelector(".challenge"),challenges:challenges,setup:function(c){c.stage();},sandbox:function(){var v=form.querySelector("[data-f]").value.trim();state.rows=["Explore: "+(v||"enter a value"),"Choose a contract, then check its expected behavior."];state.progress=1;state.result="Explore freely";if(msg)msg.textContent=v?"":"Enter a short case to explore.";paint();},lock:function(on){form.querySelectorAll("input,select,button").forEach(function(el){el.disabled=on;});}});
    form.addEventListener("input",function(){if(!section.querySelector(".challenge .ch-go")){var v=form.querySelector("[data-f]").value.trim();state.rows=["Explore: "+(v||"enter a value"),"Choose a contract, then check its expected behavior."];state.progress=1;state.result="Explore freely";if(msg)msg.textContent=v?"":"Enter a short case to explore.";paint();}});
    state.rows=["Choose an answer, then reveal the reasoning."];paint();
  }
  experimentIds.forEach(mount);
})();
