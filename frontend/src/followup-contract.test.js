import test from 'node:test';
import assert from 'node:assert/strict';
import { validateFollowup, requireFollowupPage, evolutionLabels } from './followup-contract.js';
test('peso decimal textual sin redondeo, cero ni tipos JSON alternativos', () => {
 for (const invalid of [null, true, 70, '', '0','-1','1e2','70.001','NaN','Infinity','10000']) assert.ok(validateFollowup('measurements',{weight_kg:invalid}).weight_kg);
 for (const value of ['70.00','0.01','9999.99']) assert.deepEqual(validateFollowup('measurements',{weight_kg:value}),{});
});
test('fecha zonificada y notas manuales cumplen reglas confirmadas', () => {
 const now=Date.parse('2026-10-08T00:00:00Z');
 assert.deepEqual(validateFollowup('consultations',{occurred_at:'2026-10-07T12:00:00-06:00'},now),{});
 for (const value of ['2026-10-07T12:00:00','2026-10-09T12:00:00Z','invalida','2026-02-30T12:00:00Z']) assert.ok(validateFollowup('consultations',{occurred_at:value},now).occurred_at);
 assert.deepEqual(validateFollowup('notes',{kind:'note',text:'Nota ficticia'}),{});
 assert.ok(validateFollowup('notes',{kind:'inventado',text:' '}).kind);
 assert.ok(validateFollowup('notes',{kind:'note',text:'x'.repeat(2001)}).text);
});
test('no disimula listas incompatibles; seis estados se presentan sin calcular evolución', () => {
 assert.throws(() => requireFollowupPage([]),/incompatible/);
 const page={count:0,next:null,previous:null,results:[]}; assert.equal(requireFollowupPage(page),page);
 assert.deepEqual(Object.keys(evolutionLabels),['first','increase','decrease','equal','insufficient_data','invalid_data']);
});
