/**
 * PaperTrail Lab Backend v2.5.0
 *
 * Script Properties:
 *   SPREADSHEET_ID   required
 *   ALLOWED_DOMAIN   default: toyo.jp
 *   ADMIN_EMAILS     comma-separated, optional
 *   OPENALEX_API_KEY optional
 *
 * Deploy as a web app:
 *   Execute as: User accessing the web app
 *   Access: users in the university domain
 */

const PT_SHEETS = {
  STUDENTS: 'Students',
  NOTEBOOKS: 'Notebooks',
  TRAILS: 'Trails',
  ACTIVITY: 'Activity',
  PAPER_CACHE: 'PaperCache'
};

const PT_HEADERS = {
  Students: ['student_id','real_name','nickname','display_name','display_mode','domain','created_at','updated_at','is_active'],
  Notebooks: ['notebook_id','student_id','display_name','doi','title','reading_level','schema_version','shared','created_at','updated_at','notebook_json'],
  Trails: ['trail_id','student_id','from_notebook_id','from_doi','to_doi','to_title','reason','created_at'],
  Activity: ['activity_id','student_id','action','target_id','created_at','detail_json'],
  PaperCache: ['cache_key','source','saved_at','expires_at','payload_json']
};

function doGet(e) {
  return route_((e && e.parameter && e.parameter.action) || '', e ? e.parameter : {}, null);
}

function doPost(e) {
  const action = (e && e.parameter && e.parameter.action) || '';
  let payload = {};
  try {
    payload = JSON.parse((e && e.parameter && e.parameter.payload) || '{}');
  } catch (_) {
    return json_({ok:false,error:'Invalid JSON payload.'});
  }
  return route_(action, e ? e.parameter : {}, payload);
}

function route_(action, params, payload) {
  try {
    ensureSheets_();
    const user = currentUser_();
    let data;

    switch (action) {
      case 'whoAmI':
        data = whoAmI_(user);
        break;
      case 'registerNickname':
        data = registerNickname_(user, payload.nickname);
        break;
      case 'saveProfile':
        data = saveProfile_(user, payload);
        break;
      case 'openAlexWorkByDoi':
        data = openAlexWorkByDoi_(payload.doi || params.doi);
        break;
      case 'openAlexSearch':
        data = openAlexSearch_(payload.q || params.q, payload.year || params.year);
        break;
      case 'saveNotebook':
        data = saveNotebook_(user, payload);
        break;
      case 'listMyNotebooks':
        data = listMyNotebooks_(user);
        break;
      case 'listLabNotebooks':
        data = listLabNotebooks_(user);
        break;
      case 'getNotebook':
        data = getNotebook_(user, params.notebookId);
        break;
      case 'saveTrail':
        data = saveTrail_(user, payload);
        break;
      case 'getDashboard':
        data = getDashboard_(user);
        break;
      case 'setup':
        requireAdmin_(user);
        ensureSheets_();
        data = {status:'ok',sheets:Object.values(PT_SHEETS)};
        break;
      case 'health':
        data = {status:'ok',service:'PaperTrail Lab Backend',studentId:user.studentId};
        break;
      default:
        throw new Error('Unknown action: ' + action);
    }
    return json_({ok:true,data});
  } catch (error) {
    return json_({ok:false,error:error.message || String(error)});
  }
}

function currentUser_() {
  const email = String(Session.getActiveUser().getEmail() || '').trim().toLowerCase();
  if (!email) {
    throw new Error('大学Googleアカウントを確認できません。GASの公開範囲とログイン状態を確認してください。');
  }
  const parts = email.split('@');
  const studentId = parts[0];
  const domain = parts[1] || '';
  const allowed = String(PropertiesService.getScriptProperties().getProperty('ALLOWED_DOMAIN') || 'toyo.jp').toLowerCase();
  if (allowed && domain !== allowed) {
    throw new Error('許可されていないGoogleアカウントです。');
  }
  return {
    email,
    studentId,
    domain,
    isAdmin: adminEmails_().indexOf(email) >= 0
  };
}

function whoAmI_(user) {
  let student=findStudent_(user.studentId);
  if(!student) student=upsertStudent_(user,{});
  return publicProfile_(user,student);
}

function registerNickname_(user,nickname){
  const existing=findStudent_(user.studentId)||{};
  return saveProfile_(user,{
    realName:existing.real_name||'',
    nickname:nickname,
    displayMode:'nickname'
  });
}

function saveProfile_(user,payload){
  const realName=sanitizeText_(payload.realName,50,true,'氏名');
  const nickname=sanitizeText_(payload.nickname,30,false,'表示名');
  const displayMode=payload.displayMode==='nickname'?'nickname':'real_name';
  if(displayMode==='nickname'&&!nickname) throw new Error('カスタム表示名を入力してください。');
  const record=upsertStudent_(user,{realName,nickname,displayMode});
  logActivity_(user.studentId,'profile_updated',user.studentId,{displayMode});
  return publicProfile_(user,record);
}

function publicProfile_(user,row){
  return {
    studentId:user.studentId,
    realName:row.real_name||'',
    nickname:row.nickname||'',
    displayName:row.display_name||row.real_name||row.nickname||user.studentId,
    displayMode:row.display_mode||'real_name',
    domain:user.domain,
    isAdmin:user.isAdmin,
    mode:'gas'
  };
}

function saveNotebook_(user, payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const student = findStudent_(user.studentId) || upsertStudent_(user, {});
    const sheet = sheet_(PT_SHEETS.NOTEBOOKS);
    const rows = sheetData_(sheet);
    const notebookId = String(payload.notebookId || Utilities.getUuid());
    const now = new Date().toISOString();
    const existing = rows.find(row => row.notebook_id === notebookId);

    if (existing && existing.student_id !== user.studentId && !user.isAdmin) {
      throw new Error('このNotebookを更新する権限がありません。');
    }

    const record = {
      notebook_id:notebookId,
      student_id:user.studentId,
      display_name:student.display_name || student.real_name || student.nickname || user.studentId,
      doi:String(payload.doi || ''),
      title:String(payload.title || 'Untitled'),
      reading_level:String(payload.readingLevel || 'quick'),
      schema_version:String(payload.schemaVersion || '2.5.0'),
      shared:Boolean(payload.shared),
      created_at:existing ? existing.created_at : now,
      updated_at:now,
      notebook_json:JSON.stringify(payload.notebookJson || {})
    };
    upsertRow_(sheet, 'notebook_id', record);
    logActivity_(user.studentId, existing ? 'notebook_updated' : 'notebook_created', notebookId, {
      title:record.title,
      level:record.reading_level
    });
    return publicNotebook_(record, true);
  } finally {
    lock.releaseLock();
  }
}

function listMyNotebooks_(user) {
  return sheetData_(sheet_(PT_SHEETS.NOTEBOOKS))
    .filter(row => row.student_id === user.studentId)
    .sort(byUpdatedDesc_)
    .map(row => publicNotebook_(row, false));
}

function listLabNotebooks_(user) {
  return sheetData_(sheet_(PT_SHEETS.NOTEBOOKS))
    .filter(row => truthy_(row.shared))
    .sort(byUpdatedDesc_)
    .slice(0, 100)
    .map(row => publicNotebook_(row, false));
}

function getNotebook_(user, notebookId) {
  const row = sheetData_(sheet_(PT_SHEETS.NOTEBOOKS))
    .find(item => item.notebook_id === String(notebookId || ''));
  if (!row) throw new Error('Notebookが見つかりません。');
  if (row.student_id !== user.studentId && !truthy_(row.shared) && !user.isAdmin) {
    throw new Error('このNotebookを閲覧する権限がありません。');
  }
  return publicNotebook_(row, true);
}

function saveTrail_(user, payload) {
  const now = new Date().toISOString();
  const record = {
    trail_id:Utilities.getUuid(),
    student_id:user.studentId,
    from_notebook_id:String(payload.fromNotebookId || ''),
    from_doi:String(payload.fromDoi || ''),
    to_doi:String(payload.toDoi || ''),
    to_title:String(payload.toTitle || ''),
    reason:String(payload.reason || ''),
    created_at:now
  };
  appendObject_(sheet_(PT_SHEETS.TRAILS), record);
  logActivity_(user.studentId, 'trail_created', record.trail_id, record);
  return camelTrail_(record);
}

function getDashboard_(user) {
  requireAdmin_(user);
  const notebooks = sheetData_(sheet_(PT_SHEETS.NOTEBOOKS));
  const students = sheetData_(sheet_(PT_SHEETS.STUDENTS));
  const byStudent = {};

  students.forEach(student => {
    byStudent[student.student_id] = {
      studentId:student.student_id,
      displayName:student.display_name || student.real_name || student.nickname || student.student_id,
      quickCount:0,
      carefulCount:0,
      deepCount:0,
      lastUpdatedAt:''
    };
  });

  notebooks.forEach(nb => {
    const item = byStudent[nb.student_id] || (byStudent[nb.student_id] = {
      studentId:nb.student_id,
      displayName:nb.display_name || nb.student_id,
      quickCount:0,carefulCount:0,deepCount:0,lastUpdatedAt:''
    });
    if (nb.reading_level === 'deep') item.deepCount++;
    else if (nb.reading_level === 'careful') item.carefulCount++;
    else item.quickCount++;
    if (String(nb.updated_at) > String(item.lastUpdatedAt)) item.lastUpdatedAt = nb.updated_at;
  });

  return {
    students:Object.values(byStudent).sort((a,b) => String(a.studentId).localeCompare(String(b.studentId))),
    recentNotebooks:notebooks.sort(byUpdatedDesc_).slice(0,20).map(row => publicNotebook_(row,false))
  };
}

function upsertStudent_(user,profile){
  profile=profile||{};
  const sheet=sheet_(PT_SHEETS.STUDENTS);
  const existing=findStudent_(user.studentId)||{};
  const now=new Date().toISOString();
  const realName=profile.realName!==undefined?String(profile.realName):String(existing.real_name||'');
  const nickname=profile.nickname!==undefined?String(profile.nickname):String(existing.nickname||'');
  const displayMode=profile.displayMode==='nickname'?'nickname':String(existing.display_mode||'real_name');
  const displayName=displayMode==='nickname'?(nickname||realName||user.studentId):(realName||nickname||user.studentId);
  const record={
    student_id:user.studentId,
    real_name:realName,
    nickname:nickname,
    display_name:displayName,
    display_mode:displayMode,
    domain:user.domain,
    created_at:existing.created_at||now,
    updated_at:now,
    is_active:true
  };
  upsertRow_(sheet,'student_id',record);
  return record;
}

function findStudent_(studentId) {
  return sheetData_(sheet_(PT_SHEETS.STUDENTS))
    .find(row => row.student_id === String(studentId || ''));
}

function sanitizeText_(value,maxLength,required,label){
  const text=String(value||'').trim().replace(/[<>]/g,'').slice(0,maxLength);
  if(required&&!text) throw new Error((label||'値')+'を入力してください。');
  return text;
}

function publicNotebook_(row, includeJson) {
  const result = {
    notebookId:row.notebook_id,
    studentId:row.student_id,
    displayName:row.display_name,
    doi:row.doi,
    title:row.title,
    readingLevel:row.reading_level,
    schemaVersion:row.schema_version,
    shared:truthy_(row.shared),
    createdAt:row.created_at,
    updatedAt:row.updated_at
  };
  if (includeJson) {
    try { result.notebookJson = JSON.parse(row.notebook_json || '{}'); }
    catch (_) { result.notebookJson = {}; }
  }
  return result;
}

function camelTrail_(row) {
  return {
    trailId:row.trail_id,
    studentId:row.student_id,
    fromNotebookId:row.from_notebook_id,
    fromDoi:row.from_doi,
    toDoi:row.to_doi,
    toTitle:row.to_title,
    reason:row.reason,
    createdAt:row.created_at
  };
}

function logActivity_(studentId, action, targetId, detail) {
  appendObject_(sheet_(PT_SHEETS.ACTIVITY), {
    activity_id:Utilities.getUuid(),
    student_id:studentId,
    action,
    target_id:String(targetId || ''),
    created_at:new Date().toISOString(),
    detail_json:JSON.stringify(detail || {})
  });
}

function ensureSheets_(){
  const ss=spreadsheet_();
  Object.keys(PT_HEADERS).forEach(name=>{
    let sheet=ss.getSheetByName(name);
    if(!sheet)sheet=ss.insertSheet(name);
    const headers=PT_HEADERS[name];
    if(sheet.getLastRow()===0){
      sheet.getRange(1,1,1,headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
      return;
    }
    const current=sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0].map(String);
    headers.forEach(header=>{
      if(current.indexOf(header)<0){
        sheet.getRange(1,sheet.getLastColumn()+1).setValue(header);
        current.push(header);
      }
    });
  });
}

function spreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('SPREADSHEET_IDが設定されていません。');
  return SpreadsheetApp.openById(id);
}

function sheet_(name) {
  const sheet = spreadsheet_().getSheetByName(name);
  if (!sheet) throw new Error(name + 'シートがありません。setupを実行してください。');
  return sheet;
}

function sheetData_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(String);
  return values.slice(1).filter(row => row.some(value => value !== '')).map(row => {
    const item = {};
    headers.forEach((header,index) => item[header] = row[index]);
    return item;
  });
}

function appendObject_(sheet, object) {
  const headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
  sheet.appendRow(headers.map(header => object[header] !== undefined ? object[header] : ''));
}

function upsertRow_(sheet, keyName, object) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);
  const keyIndex = headers.indexOf(keyName);
  if (keyIndex < 0) throw new Error('Key column not found: ' + keyName);
  const rowIndex = values.slice(1).findIndex(row => String(row[keyIndex]) === String(object[keyName]));
  const rowValues = headers.map(header => object[header] !== undefined ? object[header] : '');
  if (rowIndex >= 0) sheet.getRange(rowIndex + 2,1,1,headers.length).setValues([rowValues]);
  else sheet.appendRow(rowValues);
}

function requireAdmin_(user) {
  if (!user.isAdmin) throw new Error('管理者権限が必要です。');
}

function adminEmails_() {
  return String(PropertiesService.getScriptProperties().getProperty('ADMIN_EMAILS') || '')
    .toLowerCase().split(',').map(v => v.trim()).filter(Boolean);
}

function byUpdatedDesc_(a,b) {
  return String(b.updated_at || '').localeCompare(String(a.updated_at || ''));
}

function truthy_(value) {
  return value === true || String(value).toLowerCase() === 'true' || String(value) === '1';
}


function openAlexWorkByDoi_(doi){
  doi=normalizeDoi_(doi);
  if(!doi)throw new Error('DOIを入力してください。');
  const cacheKey='doi:'+doi.toLowerCase();
  const cached=paperCacheGet_(cacheKey);
  if(cached)return cached;
  const data=openAlexFetch_('/works/'+encodeURIComponent('doi:'+doi),{});
  paperCachePut_(cacheKey,'openalex',data,30);
  return data;
}

function openAlexSearch_(q,year){
  q=String(q||'').trim();
  if(q.length<3)throw new Error('検索語を入力してください。');
  const cacheKey='search:'+Utilities.base64EncodeWebSafe(q.toLowerCase()+'|'+String(year||''));
  const cached=paperCacheGet_(cacheKey);
  if(cached)return cached;
  const params={search:q,per_page:5};
  if(/^\d{4}$/.test(String(year||'')))params.filter='publication_year:'+year;
  const data=openAlexFetch_('/works',params);
  paperCachePut_(cacheKey,'openalex',data,7);
  return data;
}

function openAlexFetch_(path,params){
  const key=PropertiesService.getScriptProperties().getProperty('OPENALEX_API_KEY');
  if(!key)throw new Error('OPENALEX_API_KEYが設定されていません。');
  const query=Object.assign({},params||{},{api_key:key});
  const url='https://api.openalex.org'+path+'?'+Object.keys(query)
    .map(k=>encodeURIComponent(k)+'='+encodeURIComponent(String(query[k]))).join('&');
  const res=UrlFetchApp.fetch(url,{muteHttpExceptions:true,headers:{Accept:'application/json'}});
  if(res.getResponseCode()<200||res.getResponseCode()>=300)throw new Error('OpenAlex error '+res.getResponseCode());
  return JSON.parse(res.getContentText());
}

function normalizeDoi_(v){
  return String(v||'').trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i,'').replace(/^doi:\s*/i,'');
}

function paperCacheGet_(key){
  const row=sheetData_(sheet_(PT_SHEETS.PAPER_CACHE)).find(r=>r.cache_key===key);
  if(!row)return null;
  if(row.expires_at&&new Date(row.expires_at).getTime()<Date.now())return null;
  try{return JSON.parse(row.payload_json||'null')}catch(_){return null}
}

function paperCachePut_(key,source,payload,days){
  const now=new Date();
  const expires=new Date(now.getTime()+days*86400000);
  upsertRow_(sheet_(PT_SHEETS.PAPER_CACHE),'cache_key',{
    cache_key:key,source:source,saved_at:now.toISOString(),expires_at:expires.toISOString(),payload_json:JSON.stringify(payload)
  });
}

function json_(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}

function setupPaperTrail(){
  ensureSheets_();
}
