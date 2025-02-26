import { useNavigate } from "react-router-dom";
import { Card, Badge } from "flowbite-react";
import type { NotesResponse, TagsResponse } from "../../types/pocketbase-types";
import { getTagColor } from "../../utils/colors";

interface NoteCardProps {
  note: NotesResponse;
}

/**
 * Renders a list of tags.
 */
const renderTags = (tags: TagsResponse[]) => {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {tags.map((tag) => (
        <Badge key={tag.id} className={`cursor-pointer ${getTagColor(tag.id)}`}>
          {tag.name || "Unknown Tag"}
        </Badge>
      ))}
    </div>
  );
};

const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  const navigate = useNavigate();

  return (
    <Card className="max-w-sm cursor-pointer" onClick={() => navigate(`/notes/${note.id}`)}>
      <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        {note.title}
      </h5>
      <p className="font-normal text-gray-700 dark:text-gray-400">
        {note.content ? note.content.substring(0, 100) + "..." : "No content available."}
      </p>

      {/* Render Tags if available */}
      {note.expand?.tags?.length ? renderTags(note.expand.tags) : null}
    </Card>
  );
};

export default NoteCard;
