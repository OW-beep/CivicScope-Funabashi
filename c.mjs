const branches = {
  西: { r1:347669, r2:278722, r3:287829, loan1:423249, loan2:353594, loan3:461491, latest:304611 },
  中央: { r1:315306, r2:292727, r3:299163, loan1:553121, loan2:435853, loan3:591999, latest:316381 },
  東: { r1:275785, r2:175577, r3:176237, loan1:456607, loan2:385910, loan3:498129, latest:228311 },
  北: { r1:347097, r2:640759, r3:637086, loan1:328181, loan2:104641, loan3:325722, latest:626614 }
};
let t1=0,t2=0,t3=0,l1=0,l2=0,l3=0,lat=0;
for (const b in branches){const v=branches[b]; t1+=v.r1;t2+=v.r2;t3+=v.r3;l1+=v.loan1;l2+=v.loan2;l3+=v.loan3;lat+=v.latest;}
console.log('蔵書合計 R1',t1,'R2',t2,'R3',t3,'latest',lat);
console.log('貸出合計 R1',l1,'R2',l2,'R3',l3);
console.log('R1->latest蔵書 rate', ((lat/t1-1)*100).toFixed(1));
console.log('R1->R3貸出 rate', ((l3/l1-1)*100).toFixed(1));
