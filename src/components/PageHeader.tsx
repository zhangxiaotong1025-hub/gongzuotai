interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
}

export function PageHeader({ title, description, badge }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {badge && <span className="status-badge bg-primary/10 text-primary">{badge}</span>}
      </div>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
}
