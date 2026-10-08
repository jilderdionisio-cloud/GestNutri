import React from 'react';
import { followupFields } from './followup-contract.js';
export default function FollowupFormPreview({section}) {
 const fields=followupFields[section];
 if (!fields) return null;
 return <form aria-label="Formulario acordado pendiente de API" onSubmit={event => event.preventDefault()}><fieldset disabled><legend>Campos acordados · registro pendiente de API y migración verificadas</legend><div className="form-grid">{fields.map(field => <label key={field.key}>{field.label} *{field.options ? <select name={field.key} defaultValue=""><option value="">Selecciona un tipo</option>{field.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : React.createElement(field.multiline ? 'textarea' : 'input',{name:field.key,type:field.type || 'text',inputMode:field.inputMode,required:field.required,maxLength:field.max,defaultValue:''})}</label>)}</div></fieldset><p>Estos controles están bloqueados; no envían datos ni guardan registros.</p></form>;
}
