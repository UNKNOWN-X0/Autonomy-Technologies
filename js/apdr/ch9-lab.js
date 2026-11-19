/* APDR Chapter 9: visual traces for test design and error handling. */
(function () {
  var experimentIds = ["contract", "blackbox", "glassbox", "debug", "exceptions", "assertions"];
    var content = {
    contract: [
      ["Contract first", "Before testing is_bigger(x,y), what should be written?", "Inputs and promised result", "The loop structure of the code", "Outputs copied from a first run", "A specification gives the test its expected result. A contract says what inputs are assumed and what result is promised.", "9.1"],
      ["Unit test", "Which test checks one small function?", "Unit test", "Integration test", "Regression test", "One small unit isolates the behavior being checked. A unit test isolates one function or component."],
      ["Regression", "A fixed bug appears again after editing. Which test was missing?", "Regression test", "A new black-box partition", "A path-complete test", "A retained test detects a fixed defect if it returns. Keep a test for each fixed bug and rerun it after changes."],
      ["Integration", "Two tested functions work alone but the report is wrong. What next?", "Integration test", "Another unit test of each function", "A regression test for an old bug", "Components can fail when they exchange or combine data. Integration checks how components combine and pass values."]
    ],
    blackbox: [
      ["Zero boundary", "For sqrt(x, eps), with x ≥ 0, which case checks the lower x boundary?", "x = 0", "x = -1", "x = 1", "Zero is allowed by the stated x domain. Zero is a valid boundary in this contract."],
      ["Perfect square", "Which case checks a known exact root?", "sqrt(25)", "sqrt(2)", "sqrt(0.05)", "A known exact root makes a useful expected result. A perfect square provides a predictable result."],
      ["Irrational root", "Which input checks approximation tolerance?", "sqrt(2)", "sqrt(25)", "sqrt(0)", "Tolerance checks approximation without requiring exact equality. Check the promised squared-result interval rather than exact equality."],
      ["Excluded epsilon", "The contract says eps > 0. Which value is invalid?", "eps = 0", "eps = 0.0001", "eps = 1", "The contract requires a strictly positive epsilon. Zero is the excluded boundary."]
    ],
    glassbox: [
      ["False branch", "For if x < -1, which input takes the false branch?", "x = 2", "x = -2", "x = -5", "Two does not satisfy the condition x < -1, so the false branch runs."],
      ["True branch", "For if x < -1, which input takes the true branch?", "x = -2", "x = 2", "x = -1", "Minus two satisfies the condition x < -1, so the true branch runs."],
      ["Boundary defect", "The function is absolute value with if x < -1. Which test reveals the defect?", "x = -1", "x = 2", "x = -2", "At minus one the faulty condition returns the input unchanged. It returns -1, but the contract requires 1."],
      ["Coverage limit", "Both branches ran. What is still needed?", "Specification boundary tests", "Nothing: full coverage proves correctness", "Rerun the same two tests", "Execution coverage cannot replace specification-based cases. Path coverage does not guarantee correct boundary behavior."]
    ],
    debug: [
      ["Minimal input", "A long input fails. What should you find first?", "Smallest input that still fails", "A larger input that fails faster", "The line edited most recently", "The smallest reproducer removes unrelated behavior. A minimal reproducer removes unrelated behavior."],
      ["Bisection", "A value becomes wrong somewhere in 100 steps. Where inspect first?", "Around the midpoint", "Only the final result", "Step 1, then every step in order", "The midpoint separates earlier and later computation. Then focus on the half containing the first divergence."],
      ["Hypothesis", "What should a debugging change test?", "One explanation at a time", "Several fixes at once", "Whatever change makes it compile", "One change at a time lets evidence distinguish causes. A controlled experiment makes cause and effect clearer."],
      ["Rerun", "After a fix, what should be rerun?", "The failing case and previous tests", "Only the failing case", "Nothing, if the program starts", "Retesting the failing case confirms the fix; the older tests catch collateral damage. Confirm the fix and catch collateral regressions."]
    ],
    exceptions: [
      ["Bad conversion", "int('cat') raises which exception?", "ValueError", "TypeError", "NameError", "The string is not a valid integer value. The type is acceptable but the value is not an integer literal."],
      ["Wrong operation type", "'3' / 4 raises which exception?", "TypeError", "ValueError", "ZeroDivisionError", "Division is not defined for these operand types. The operation is not defined for those operand types."],
      ["Index outside list", "items[4] for a three-element list raises?", "IndexError", "KeyError", "ValueError", "Index four lies outside a three-element list. The index lies outside the valid range."],
      ["Cleanup", "Which clause runs on success or failure?", "finally", "else", "except", "Finally executes on either success or failure. Use finally for cleanup that must happen on either path."]
    ],
    assertions: [
      ["Internal invariant", "A count should never be negative inside an algorithm. What check fits?", "assert count >= 0", "try/except ValueError around the loop", "print(count) and carry on", "Assertions are for programmer assumptions inside the algorithm. An assertion documents an internal assumption."],
      ["User input", "A web form receives invalid age data. What should validate it?", "Explicit input validation", "assert age >= 0", "A bare except", "External data needs explicit validation and a defined response. Required behavior must not depend on assertions."],
      ["Optimization", "What may Python do to assert under -O?", "Remove the assertion", "Turn it into a warning", "Raise ValueError instead", "Python may omit assert statements under -O. Assertions are not a runtime validation boundary."],
      ["Purpose", "What does a false assertion raise in a normal run?", "AssertionError", "ValueError", "Nothing: false asserts are ignored", "A failed assertion raises AssertionError in normal execution. It stops near the violated internal assumption."]
    ]
  };
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
      var answer=row[2], wrong1=row[3], wrong2=row[4], why=row[5].replace(/&/g,"&amp;").replace(/</g,"&lt;");
      var refs={contract:"9.2",blackbox:"9.3",glassbox:"9.4",debug:"9.5",exceptions:"9.6",assertions:"9.8"};
      var choices=[[answer,answer],[wrong1,wrong1],[wrong2,wrong2]]; choices=choices.slice(i%3).concat(choices.slice(0,i%3));
      return {id:id+"-"+(i+1),short:row[0],ref:row[6]||refs[id],prompt:row[1],answer:answer,options:choices,why:"<p>"+why+"</p>",stage:function(){state.rows=["Question: "+row[1],"Reason: "+row[5]];state.progress=0;state.result="Answer: "+answer;paint();},preview:function(){},reveal:function(){return Lab.tween(700,function(t){state.progress=t;paint();});}};
    }
    var challenges=content[id].map(make);
    Lab.experiment({id:id,title:section.querySelector("h2").textContent,card:section.querySelector(".challenge"),challenges:challenges,setup:function(c){c.stage();},sandbox:function(){var v=form.querySelector("[data-f]").value.trim();state.rows=["Explore: "+(v||"enter a value"),"Choose a contract, then check its expected behavior."];state.progress=1;state.result="Explore freely";if(msg)msg.textContent=v?"":"Enter a short case to explore.";paint();},lock:function(on){form.querySelectorAll("input,select,button").forEach(function(el){el.disabled=on;});}});
    form.addEventListener("input",function(){if(!section.querySelector(".challenge .ch-go")){var v=form.querySelector("[data-f]").value.trim();state.rows=["Explore: "+(v||"enter a value"),"Choose a contract, then check its expected behavior."];state.progress=1;state.result="Explore freely";if(msg)msg.textContent=v?"":"Enter a short case to explore.";paint();}});
    state.rows=["Choose an answer, then reveal the reasoning."];paint();
  }
  experimentIds.forEach(mount);
})();
