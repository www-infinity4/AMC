(function(){
  "use strict";

  window.AMC_PROGRAMS={
    hisGirlFriday:{id:"AMC-HGF",title:"His Girl Friday",year:1940,collection:"Prestige Classic · Screwball Comedy",runtimeSeconds:5520,videoId:"E21hRISkLBA",cleared:true},
    charade:{id:"AMC-CHARADE",title:"Charade",year:1963,collection:"Prestige Classic · Mystery Romance",runtimeSeconds:6780,videoId:"SLQc9kSkRmo",cleared:true},
    detour:{id:"AMC-DETOUR",title:"Detour",year:1945,collection:"Prestige Classic · Film Noir",runtimeSeconds:4080,videoId:"QqBPGnSXF8Q",cleared:true},
    general:{id:"AMC-GENERAL",title:"The General",year:1926,collection:"Prestige Classic · Silent Comedy",runtimeSeconds:4500,videoId:"2JHydgbK9lQ",cleared:true},
    scarletStreet:{id:"AMC-SCARLET",title:"Scarlet Street",year:1945,collection:"Prestige Classic · Fritz Lang Noir",runtimeSeconds:6120,videoId:"9srGe68u4qQ",cleared:true},
    doa:{id:"AMC-DOA",title:"D.O.A.",year:1949,collection:"Prestige Classic · Film Noir",runtimeSeconds:4980,videoId:"BhbPMf7Jz10",cleared:true}
  };

  const PRESTIGE=["hisGirlFriday","charade","detour","general","scarletStreet","doa"];

  // Twelve two-hour presentation windows. Daily hashing changes the order while keeping
  // every feature full-length and preventing the same title from running back-to-back.
  window.AMC_DAY_TEMPLATE=[];
  for(let minute=0;minute<1440;minute+=120){
    window.AMC_DAY_TEMPLATE.push({minute,duration:120,choices:PRESTIGE,type:"movie"});
  }

  window.AMC_SOURCE_TARGETS=[
    {title:"Casablanca",year:1942,status:"priority-rights-target",rule:"Schedule only when a legitimate full embeddable source is available."},
    {title:"Gone with the Wind",year:1939,status:"priority-rights-target",rule:"Schedule only when a legitimate full embeddable source is available."},
    {title:"The Maltese Falcon",year:1941,status:"priority-rights-target",rule:"Schedule only when a legitimate full embeddable source is available."},
    {title:"Citizen Kane",year:1941,status:"priority-rights-target",rule:"Schedule only when a legitimate full embeddable source is available."}
  ];

  window.INFINITY_CHANNEL={
    id:"AMC",
    name:"AMC Classic Movies",
    era:"1920s–1960s prestige cinema",
    reset:"12:00 AM viewer local time",
    sourcePolicy:"Full movies only from rights-cleared, official, or legitimate public-domain sources. No trailers, recap videos, chopped clips, or low-grade filler.",
    programmingPolicy:"Prioritize recognized classics, major stars, film noir, screwball comedy, prestige drama and landmark silent films. Avoid low-quality bargain-bin programming.",
    rightsTargets:"Casablanca and Gone with the Wind remain top programming targets but are not falsely scheduled from unauthorized uploads."
  };
})();