import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { SearchIcon } from "lucide-react";

function SearchInput({
  searchQuery,
  setSearchQuery,
  filteredRepositoriescount,
}: {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filteredRepositoriescount: number;
}) {
  return (
    <InputGroup>
      <InputGroupInput
        type="text"
        placeholder="Search repositories"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <InputGroupAddon>
        <SearchIcon className="size-4" />
      </InputGroupAddon>
      {searchQuery && (
        <InputGroupAddon align="inline-end">
          {filteredRepositoriescount} results
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}

export default SearchInput;
