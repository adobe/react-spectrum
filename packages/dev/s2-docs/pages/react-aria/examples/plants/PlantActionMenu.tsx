import {Button} from 'tailwind-starter/Button';
import {Mail, MoreHorizontal, PencilIcon, ShareIcon, StarIcon, TrashIcon, Twitter} from 'lucide-react';
import {Menu, MenuItem, MenuTrigger, SubmenuTrigger} from 'tailwind-starter/Menu';
import {Plant} from './plants';

interface PlantActionMenuProps {
  item: Plant,
  onFavoriteChange: (id: number, isFavorite: boolean) => void,
  onEdit: (item: Plant) => void,
  onDelete: (item: Plant) => void
}

export function PlantActionMenu(props: PlantActionMenuProps) {
  let {item, onFavoriteChange, onEdit, onDelete} = props;
  return (
    <MenuTrigger>
      <Button aria-label="Actions" variant="secondary" className="row-span-2 place-self-center bg-transparent dark:bg-transparent border-transparent dark:border-transparent">
        <MoreHorizontal aria-hidden className="w-5 h-5" />
      </Button>
      <Menu>
        <MenuItem id="favorite" onAction={() => onFavoriteChange(item.id, !item.isFavorite)}>
          <StarIcon aria-hidden className="w-4 h-4" /> {item.isFavorite ? 'Unfavorite' : 'Favorite'}
        </MenuItem>
        <MenuItem id="edit" onAction={() => onEdit(item)}>
          <PencilIcon aria-hidden className="w-4 h-4" /> Edit…
        </MenuItem>
        <MenuItem id="delete" onAction={() => onDelete(item)}>
          <TrashIcon aria-hidden className="w-4 h-4" /> Delete…
        </MenuItem>
        <SubmenuTrigger>
          <MenuItem aria-label="Share">
            <ShareIcon aria-hidden className="w-4 h-4" />
            Share
          </MenuItem>
          <Menu>
            <MenuItem href={`https://x.com/intent/tweet?text=${encodeURIComponent(item.common_name)}`} target="blank" rel="noopener noreferrer" aria-label="X"><Twitter aria-hidden className="w-4 h-4" /> X…</MenuItem>
            <MenuItem href={`mailto:abc@example.com?subject=${encodeURIComponent(item.common_name)}`} target="blank" rel="noopener noreferrer" aria-label="Email"><Mail aria-hidden className="w-4 h-4" /> Email…</MenuItem>
          </Menu>
        </SubmenuTrigger>
      </Menu>
    </MenuTrigger>
  );
}
