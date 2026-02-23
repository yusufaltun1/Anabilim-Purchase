export interface UserBasic {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export interface UserGroup {
  id: number;
  name: string;
  description?: string;
  positionX: number;
  positionY: number;
  members: UserBasic[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UserGroupLink {
  id: number;
  sourceGroupId: number;
  targetGroupId: number;
  linkLabel?: string;
  createdAt?: string;
}

export interface CreateUserGroupRequest {
  name: string;
  description?: string;
  positionX?: number;
  positionY?: number;
}

export interface UpdateUserGroupRequest {
  name?: string;
  description?: string;
  positionX?: number;
  positionY?: number;
}

export interface CreateUserGroupLinkRequest {
  sourceGroupId: number;
  targetGroupId: number;
  linkLabel?: string;
}

export interface UserGroupMembersRequest {
  userGroupId: number;
  userIds: number[];
}

export interface WhiteboardData {
  groups: UserGroup[];
  links: UserGroupLink[];
}

export interface GroupPositionItem {
  id: number;
  positionX: number;
  positionY: number;
}

export interface UpdateGroupPositionsRequest {
  positions: GroupPositionItem[];
}
