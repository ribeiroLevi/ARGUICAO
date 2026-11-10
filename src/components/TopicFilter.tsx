export interface ArticleTopic { id: string; title: string }
export interface TopicFilterProps {
  topics: ArticleTopic[];
  selected: string;
  onSelect: (articleId: string) => void;
}

export function TopicFilter({ topics, selected, onSelect }: TopicFilterProps) {
  return (
    <nav className="topic-filter" aria-label="Filtrar por artigo">
      <button type="button" aria-pressed={selected === 'all'} onClick={() => onSelect('all')}>TODOS</button>
      {topics.map((topic) => (
        <button type="button" key={topic.id} aria-pressed={selected === topic.id} onClick={() => onSelect(topic.id)}>
          {topic.title}
        </button>
      ))}
    </nav>
  );
}
