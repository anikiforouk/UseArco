import Link from 'next/link';

const STAGE_BADGE = {
  idea: 'badge-idea',
  mvp: 'badge-mvp',
  launched: 'badge-launched',
  scaling: 'badge-scaling',
};

const STAGE_LABEL = {
  idea: 'Idea',
  mvp: 'MVP',
  launched: 'Launched',
  scaling: 'Scaling',
};

export default function ProjectCard({ project }) {
  const initials = project.owner?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || '?';

  return (
    <Link href={`/projects/${project._id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <span className={`${STAGE_BADGE[project.stage] || 'badge-idea'}`}
            style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {STAGE_LABEL[project.stage] || project.stage}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'capitalize' }}>
            {project.category}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)',
          marginBottom: '8px', lineHeight: '1.4',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>
          {project.title}
        </h3>

        {/* Description */}
        <p style={{
          fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6',
          marginBottom: '16px', flex: 1,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>
          {project.description}
        </p>

        {/* Skills */}
        {project.skillsNeeded?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
            {project.skillsNeeded.slice(0, 3).map(skill => (
              <span key={skill} className="tag">{skill}</span>
            ))}
            {project.skillsNeeded.length > 3 && (
              <span className="tag">+{project.skillsNeeded.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: '14px', borderTop: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="avatar" style={{ width: '28px', height: '28px', fontSize: '11px' }}>
              {initials}
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {project.owner?.name?.split(' ')[0]}
            </span>
          </div>
          {project.equity && (
            <span style={{
              fontSize: '12px', fontWeight: 700, color: 'var(--accent)',
              background: 'var(--accent-soft)', padding: '3px 10px', borderRadius: '20px'
            }}>
              {project.equity}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
