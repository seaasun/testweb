google.maps.__gjsload__('overlay', function(_){'use strict';var oC=_.oa("b"),pC=_.na(),qC=function(){var a=this.kg;if(this.getPanes()){if(this.getProjection()){if(!a.b&&this.onAdd)this.onAdd();a.b=!0;this.draw()}}else{if(a.b)if(this.onRemove)this.onRemove();else this.remove();a.b=!1}},rC=function(a){a.kg=a.kg||new pC;return a.kg},sC=function(a){_.Sf.call(this);this.aa=(0,_.u)(qC,a)};_.v(oC,_.G);
oC.prototype.changed=function(a){"outProjection"!=a&&(a=!!(this.get("offset")&&this.get("projectionTopLeft")&&this.get("projection")&&_.B(this.get("zoom"))),a==!this.get("outProjection")&&this.set("outProjection",a?this.b:null))};_.v(sC,_.Sf);_.kc("overlay",{jl:function(a){var b=a.getMap(),c=rC(a),d=c.un;c.un=b;d&&(c=rC(a),(d=c.fa)&&d.unbindAll(),(d=c.Ai)&&d.unbindAll(),a.unbindAll(),a.set("panes",null),a.set("projection",null),_.y(c.S,_.C.removeListener),c.S=null,c.fb&&(c.fb.aa(),c.fb=null),_.en("Ox","-p",a));if(b){c=rC(a);d=c.fb;d||(d=c.fb=new sC(a));_.y(c.S||[],_.C.removeListener);var e=c.fa=c.fa||new _.wm,f=b.__gm;e.bindTo("zoom",f);e.bindTo("offset",f);e.bindTo("center",f,"projectionCenterQ");e.bindTo("projection",b);e.bindTo("projectionTopLeft",
f);e=c.Ai=c.Ai||new oC(e);e.bindTo("zoom",f);e.bindTo("offset",f);e.bindTo("projection",b);e.bindTo("projectionTopLeft",f);a.bindTo("projection",e,"outProjection");a.bindTo("panes",f);e=(0,_.u)(d.N,d);c.S=[_.C.addListener(a,"panes_changed",e),_.C.addListener(f,"zoom_changed",e),_.C.addListener(f,"offset_changed",e),_.C.addListener(b,"projection_changed",e),_.C.addListener(f,"projectioncenterq_changed",e),_.C.forward(b,"forceredraw",d)];d.N();b instanceof _.Nd&&(_.bn(b,"Ox"),_.dn("Ox","-p",a,!!b.b))}}});});