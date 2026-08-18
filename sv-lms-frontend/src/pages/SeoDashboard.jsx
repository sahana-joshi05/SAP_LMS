import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Megaphone, Plus, Search, Target, TrendingUp } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import StatCard from '../components/StatCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Badge from '../components/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';

export default function SeoDashboard() {
  const { auth } = useAuth();
  const [leads, setLeads] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [pages, setPages] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [keywordForm, setKeywordForm] = useState({ keyword: '', location: '', search_intent: '', target_page: '', current_rank: '', target_rank: '' });
  const [pageForm, setPageForm] = useState({ title: '', url_slug: '', meta_description: '', h1: '', cta: '' });
  const [taskForm, setTaskForm] = useState({ topic: '', keyword: '', task_type: 'content', status: 'todo', publishing_date: '' });
  const [msg, setMsg] = useState(null);

  const load = () => {
    Promise.all([
      api.listLeads(auth.token),
      api.listSeoKeywords(auth.token),
      api.listSeoPages(auth.token),
      api.listSeoTasks(auth.token),
    ])
      .then(([leadList, keywordList, pageList, taskList]) => {
        setLeads(leadList);
        setKeywords(keywordList);
        setPages(pageList);
        setTasks(taskList);
      })
      .catch((e) => setMsg({ type: 'error', text: e.message }));
  };

  useEffect(() => { load(); }, []);

  const save = async (fn, successText) => {
    setMsg(null);
    try {
      await fn();
      setMsg({ type: 'success', text: successText });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const sourceRows = useMemo(() => {
    const counts = leads.reduce((acc, lead) => {
      const source = lead.source || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count);
  }, [leads]);

  const organicLeads = leads.filter((lead) => ['seo', 'organic', 'google'].includes((lead.source || '').toLowerCase())).length;
  const convertedLeads = leads.filter((lead) => ['Enrolled', 'Converted'].includes(lead.status)).length;
  const conversionRate = leads.length ? Math.round((convertedLeads / leads.length) * 100) : 0;

  return (
    <Layout>
      <PageHeader title="SEO & Marketing" subtitle="Lead sources, keywords, landing pages, content calendar, and campaign tasks" />
      {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}

      <div className="stat-grid">
        <StatCard icon={Search} num={organicLeads} label="Organic Leads" />
        <StatCard icon={FileText} num={pages.length} label="Landing Pages" />
        <StatCard icon={Target} num={keywords.length} label="Tracked Keywords" />
        <StatCard icon={TrendingUp} num={`${conversionRate}%`} label="Lead Conversion" />
      </div>

      <div className="card-grid-2">
        <div className="card">
          <h3><Plus /> Add keyword</h3>
          <form className="inline-form" onSubmit={(e) => {
            e.preventDefault();
            save(() => api.createSeoKeyword(auth.token, keywordForm), 'Keyword added.');
            setKeywordForm({ keyword: '', location: '', search_intent: '', target_page: '', current_rank: '', target_rank: '' });
          }}>
            <div className="field"><label>Keyword</label><input value={keywordForm.keyword} onChange={(e) => setKeywordForm({ ...keywordForm, keyword: e.target.value })} required /></div>
            <div className="field"><label>Location</label><input value={keywordForm.location} onChange={(e) => setKeywordForm({ ...keywordForm, location: e.target.value })} /></div>
            <div className="field"><label>Intent</label><input value={keywordForm.search_intent} onChange={(e) => setKeywordForm({ ...keywordForm, search_intent: e.target.value })} /></div>
            <div className="field"><label>Target page</label><input value={keywordForm.target_page} onChange={(e) => setKeywordForm({ ...keywordForm, target_page: e.target.value })} /></div>
            <div className="field"><label>Rank</label><input type="number" value={keywordForm.current_rank} onChange={(e) => setKeywordForm({ ...keywordForm, current_rank: e.target.value })} /></div>
            <div className="field"><label>Target</label><input type="number" value={keywordForm.target_rank} onChange={(e) => setKeywordForm({ ...keywordForm, target_rank: e.target.value })} /></div>
            <button className="btn" type="submit">Add</button>
          </form>
        </div>

        <div className="card">
          <h3><FileText /> Add landing page</h3>
          <form className="inline-form" onSubmit={(e) => {
            e.preventDefault();
            save(() => api.createSeoPage(auth.token, pageForm), 'Landing page saved.');
            setPageForm({ title: '', url_slug: '', meta_description: '', h1: '', cta: '' });
          }}>
            <div className="field"><label>Title</label><input value={pageForm.title} onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })} required /></div>
            <div className="field"><label>Slug</label><input value={pageForm.url_slug} onChange={(e) => setPageForm({ ...pageForm, url_slug: e.target.value })} required /></div>
            <div className="field"><label>H1</label><input value={pageForm.h1} onChange={(e) => setPageForm({ ...pageForm, h1: e.target.value })} /></div>
            <div className="field"><label>CTA</label><input value={pageForm.cta} onChange={(e) => setPageForm({ ...pageForm, cta: e.target.value })} /></div>
            <div className="field"><label>Meta</label><textarea rows={1} value={pageForm.meta_description} onChange={(e) => setPageForm({ ...pageForm, meta_description: e.target.value })} /></div>
            <button className="btn" type="submit">Save</button>
          </form>
        </div>
      </div>

      <div className="card">
        <h3><Plus /> Add SEO task</h3>
        <form className="inline-form" onSubmit={(e) => {
          e.preventDefault();
          save(() => api.createSeoTask(auth.token, taskForm), 'SEO task created.');
          setTaskForm({ topic: '', keyword: '', task_type: 'content', status: 'todo', publishing_date: '' });
        }}>
          <div className="field"><label>Topic</label><input value={taskForm.topic} onChange={(e) => setTaskForm({ ...taskForm, topic: e.target.value })} required /></div>
          <div className="field"><label>Keyword</label><input value={taskForm.keyword} onChange={(e) => setTaskForm({ ...taskForm, keyword: e.target.value })} /></div>
          <div className="field"><label>Type</label><input value={taskForm.task_type} onChange={(e) => setTaskForm({ ...taskForm, task_type: e.target.value })} /></div>
          <div className="field"><label>Publish date</label><input type="date" value={taskForm.publishing_date} onChange={(e) => setTaskForm({ ...taskForm, publishing_date: e.target.value })} /></div>
          <button className="btn" type="submit">Create</button>
        </form>
      </div>

      <div className="card-grid-2">
        <div className="card">
          <h3><Megaphone /> Lead source performance</h3>
          {sourceRows.length === 0 ? (
            <div className="empty-state">No lead-source data yet.</div>
          ) : (
            <table>
              <thead><tr><th>Source</th><th>Leads</th><th>Share</th></tr></thead>
              <tbody>{sourceRows.map((row) => <tr key={row.source}><td>{row.source}</td><td className="num-cell">{row.count}</td><td className="num-cell">{Math.round((row.count / leads.length) * 100)}%</td></tr>)}</tbody>
            </table>
          )}
        </div>
        <div className="card">
          <h3><Search /> Keyword movement</h3>
          <table>
            <thead><tr><th>Keyword</th><th>Location</th><th>Rank</th><th>Target</th></tr></thead>
            <tbody>{keywords.map((item) => <tr key={item.id}><td>{item.keyword}</td><td>{item.location}</td><td className="num-cell">{item.current_rank || '-'}</td><td className="num-cell">{item.target_rank || '-'}</td></tr>)}</tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3><FileText /> Landing pages and content calendar</h3>
        <table>
          <thead><tr><th>Topic / Page</th><th>Keyword / Slug</th><th>Type</th><th>Status</th></tr></thead>
          <tbody>
            {pages.map((page) => <tr key={`p-${page.id}`}><td>{page.title}</td><td>{page.url_slug}</td><td>Landing page</td><td><Badge status={page.status} /></td></tr>)}
            {tasks.map((task) => <tr key={`t-${task.id}`}><td>{task.topic}</td><td>{task.keyword}</td><td>{task.task_type}</td><td><Badge status={task.status} /></td></tr>)}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
