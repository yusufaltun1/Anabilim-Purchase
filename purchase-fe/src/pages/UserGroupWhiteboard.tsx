import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  type NodeProps,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Navigation } from '../components/Navigation';
import { userGroupService } from '../services/user-group.service';
import { userService } from '../services/user.service';
import type { UserGroup, UserGroupLink, WhiteboardData } from '../types/user-group';
import type { User } from '../types/user';

const NODE_TYPE_GROUP = 'group';

function GroupNode({ data, selected }: NodeProps<{ label: string; memberCount: number; description?: string }>) {
  return (
    <div
      className={`relative px-4 py-3 rounded-xl border-2 shadow-lg min-w-[160px] transition-all ${
        selected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-white hover:border-indigo-300'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-indigo-500" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-indigo-500" />
      <div className="font-semibold text-gray-900 truncate max-w-[200px]">{data.label || 'Grup'}</div>
      <div className="text-xs text-gray-500 mt-1">
        {data.memberCount ?? 0} üye
        {data.description ? ` · ${data.description.slice(0, 30)}${data.description.length > 30 ? '…' : ''}` : ''}
      </div>
    </div>
  );
}

const nodeTypes = { [NODE_TYPE_GROUP]: GroupNode };

function whiteboardToFlow(data: WhiteboardData): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = (data.groups || []).map((g: UserGroup) => ({
    id: String(g.id),
    type: NODE_TYPE_GROUP,
    position: { x: g.positionX ?? 0, y: g.positionY ?? 0 },
    data: {
      label: g.name,
      memberCount: g.members?.length ?? 0,
      description: g.description,
    },
  }));
  const edges: Edge[] = (data.links || []).map((l: UserGroupLink) => ({
    id: `e-${l.id}`,
    source: String(l.sourceGroupId),
    target: String(l.targetGroupId),
    label: l.linkLabel,
  }));
  return { nodes, edges };
}

function UserGroupWhiteboardInner() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [groupMembersLoading, setGroupMembersLoading] = useState(false);
  const [savingMembers, setSavingMembers] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [creating, setCreating] = useState(false);
  const [savingPositions, setSavingPositions] = useState(false);
  const [positionSaveMessage, setPositionSaveMessage] = useState<'success' | 'error' | null>(null);
  const [memberSaveMessage, setMemberSaveMessage] = useState<'success' | 'error' | null>(null);
  const selectedGroupName = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId)?.data?.label : null;
  const lastLoadedGroupIdRef = useRef<string | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userListPage, setUserListPage] = useState(1);
  const USERS_PER_PAGE = 20;

  const loadWhiteboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userGroupService.getWhiteboardData();
      const { nodes: n, edges: e } = whiteboardToFlow(data);
      setNodes(n);
      setEdges(e);
    } catch (err) {
      setError('Whiteboard yüklenemedi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const list = await userService.getAllUsers();
      const arr = Array.isArray(list) ? list : (list && (list as { data?: User[] }).data) ? (list as { data: User[] }).data : [];
      setUsers(arr);
      if (arr.length === 0) {
        setUsersError('Sistemde kullanıcı yok veya liste boş. Sistem > Kullanıcılar bölümünden kullanıcı ekleyin.');
      }
    } catch {
      setUsers([]);
      setUsersError('Kullanıcı listesi yüklenemedi. Giriş yaptığınızdan emin olup sağdaki "Yenile" ile tekrar deneyin.');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWhiteboard();
    loadUsers();
  }, [loadWhiteboard, loadUsers]);

  // Seçili node'u nodes state'inden al; grup üyelerini sadece seçim değişince yükle
  useEffect(() => {
    const selected = nodes.find((n) => n.selected);
    const id = selected?.id ?? null;
    setSelectedNodeId((prev) => (prev !== id ? id : prev));
    if (id != null && lastLoadedGroupIdRef.current !== id) {
      setUserSearchQuery('');
      setUserListPage(1);
    }
    if (id == null) {
      lastLoadedGroupIdRef.current = null;
      setSelectedUserIds([]);
      return;
    }
    if (lastLoadedGroupIdRef.current === id) return;
    lastLoadedGroupIdRef.current = id;
    const numId = Number(id);
    if (Number.isNaN(numId)) {
      setSelectedUserIds([]);
      return;
    }
    setGroupMembersLoading(true);
    userGroupService
      .getGroupById(numId)
      .then((g) => {
        setSelectedUserIds(g.members?.map((m) => m.id).filter((x): x is number => x != null) ?? []);
      })
      .catch(() => setSelectedUserIds([]))
      .finally(() => setGroupMembersLoading(false));
  }, [nodes]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    changes.forEach((c) => {
      if (c.type === 'remove' && 'id' in c && c.id) {
        userGroupService.deleteGroup(Number(c.id)).catch((err) => console.error('Grup silinemedi:', err));
      }
    });
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    changes.forEach((c) => {
      if (c.type === 'remove' && 'id' in c && c.id) {
        const linkId = String(c.id).startsWith('e-') ? String(c.id).slice(2) : String(c.id);
        const numId = Number(linkId);
        if (!Number.isNaN(numId)) {
          userGroupService.deleteLink(numId).catch((err) => console.error('Bağlantı silinemedi:', err));
        }
      }
    });
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback(
    async (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      try {
        const link = await userGroupService.createLink({
          sourceGroupId: Number(connection.source),
          targetGroupId: Number(connection.target),
        });
        setEdges((eds) => [...eds, { id: `e-${link.id}`, source: connection.source!, target: connection.target! }]);
      } catch (err) {
        console.error('Bağlantı oluşturulamadı:', err);
        alert('Bağlantı oluşturulamadı. Aynı gruba veya zaten var olan bağlantıya izin verilmez.');
      }
    },
    []
  );

  const onNodeDragStop = useCallback(
    async (_: React.MouseEvent, __: Node, node: Node) => {
      const id = Number(node.id);
      if (Number.isNaN(id)) return;
      const pos = node.position ?? { x: 0, y: 0 };
      const x = typeof pos.x === 'number' ? pos.x : 0;
      const y = typeof pos.y === 'number' ? pos.y : 0;
      try {
        await userGroupService.updateGroupPosition(id, x, y);
        setPositionSaveMessage('success');
        setTimeout(() => setPositionSaveMessage(null), 2000);
      } catch (err) {
        console.error('Pozisyon güncellenemedi:', err);
        setPositionSaveMessage('error');
        setTimeout(() => setPositionSaveMessage(null), 3000);
      }
    },
    []
  );

  const handleSaveAllPositions = useCallback(async () => {
    setSavingPositions(true);
    setPositionSaveMessage(null);
    try {
      const positions = nodes
        .map((n) => {
          const id = Number(n.id);
          if (Number.isNaN(id)) return null;
          const pos = n.position ?? { x: 0, y: 0 };
          return {
            id,
            positionX: typeof pos.x === 'number' ? pos.x : 0,
            positionY: typeof pos.y === 'number' ? pos.y : 0,
          };
        })
        .filter((p): p is { id: number; positionX: number; positionY: number } => p != null);
      await userGroupService.updateGroupPositions({ positions });
      setPositionSaveMessage('success');
      setTimeout(() => setPositionSaveMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setPositionSaveMessage('error');
      setTimeout(() => setPositionSaveMessage(null), 4000);
    } finally {
      setSavingPositions(false);
    }
  }, [nodes]);

  const handleAddGroup = useCallback(async () => {
    const name = newGroupName.trim() || 'Yeni Grup';
    setCreating(true);
    try {
      const created = await userGroupService.createGroup({
        name,
        positionX: 250,
        positionY: 150,
      });
      setNodes((nds) => [
        ...nds,
        {
          id: String(created.id),
          type: NODE_TYPE_GROUP,
          position: { x: created.positionX ?? 250, y: created.positionY ?? 150 },
          data: { label: created.name, memberCount: 0, description: created.description },
        },
      ]);
      setNewGroupName('');
    } catch (err) {
      console.error(err);
      alert('Grup oluşturulamadı.');
    } finally {
      setCreating(false);
    }
  }, [newGroupName]);

  const handleSaveMembers = useCallback(async () => {
    if (!selectedNodeId) return;
    setSavingMembers(true);
    try {
      await userGroupService.setGroupMembers({
        userGroupId: Number(selectedNodeId),
        userIds: selectedUserIds,
      });
      setNodes((nds) =>
        nds.map((n) =>
          n.id === selectedNodeId
            ? { ...n, data: { ...n.data, memberCount: selectedUserIds.length } }
            : n
        )
      );
      setMemberSaveMessage('success');
      setTimeout(() => setMemberSaveMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setMemberSaveMessage('error');
      setTimeout(() => setMemberSaveMessage(null), 4000);
    } finally {
      setSavingMembers(false);
    }
  }, [selectedNodeId, selectedUserIds]);

  const toggleUser = useCallback((userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center p-12">
          <p className="text-gray-600">Yükleniyor…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="p-6">
          <p className="text-red-600">{error}</p>
          <button
            type="button"
            onClick={loadWhiteboard}
            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Tekrar dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      <div className="flex-1 flex" style={{ height: 'calc(100vh - 4rem)' }}>
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            connectOnClick={false}
            deleteKeyCode={['Backspace', 'Delete']}
          >
            <Background />
            <Controls />
            <MiniMap />
            <Panel position="top-left" className="flex flex-col gap-2 bg-white/95 rounded-lg shadow p-3 m-4 max-w-xs">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Grup adı"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-sm w-40"
                />
                <button
                  type="button"
                  onClick={handleAddGroup}
                  disabled={creating}
                  className="px-3 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {creating ? '…' : 'Yeni Grup'}
                </button>
              </div>
              <button
                type="button"
                onClick={handleSaveAllPositions}
                disabled={savingPositions || nodes.length === 0}
                className="px-3 py-2 bg-emerald-600 text-white rounded text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                {savingPositions ? 'Kaydediliyor…' : 'Pozisyonları kaydet'}
              </button>
              {positionSaveMessage === 'success' && (
                <p className="text-xs text-emerald-600">Pozisyonlar kaydedildi.</p>
              )}
              {positionSaveMessage === 'error' && (
                <p className="text-xs text-red-600">Pozisyonlar kaydedilemedi.</p>
              )}
              <button
                type="button"
                onClick={loadWhiteboard}
                className="text-sm text-gray-600 hover:text-indigo-600"
              >
                Yenile
              </button>
              <p className="text-xs text-gray-500">
                <strong>Kullanıcı atama:</strong> Tahtada bir kutuya (gruba) tıklayın → sağdaki panelde o gruba atanacak kullanıcıları işaretleyin → &quot;Üyeleri kaydet&quot;e basın.
              </p>
              <p className="text-xs text-gray-500">
                Kutuları sürükleyerek konumunu değiştirin; &quot;Pozisyonları kaydet&quot; ile hepsini kaydedin. Altındaki gruba bağlamak için kutunun altındaki noktadan sürükleyip diğer kutunun üstüne bırakın. Silmek için seçip Delete.
              </p>
            </Panel>
          </ReactFlow>
        </div>

        <aside className="w-80 h-full bg-white border-l border-gray-200 shadow-lg flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Rollere kullanıcı atama</h3>
            {selectedNodeId ? (
              <>
                <p className="text-sm text-indigo-600 mt-1 font-medium truncate" title={selectedGroupName ?? ''}>
                  Seçili grup: {selectedGroupName ?? '—'}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">Bu gruba (role) atanacak kullanıcıları işaretleyip kaydedin.</p>
              </>
            ) : (
              <p className="text-sm text-gray-500 mt-1">
                Tahtada bir grup (kutu) seçin. Seçtiğiniz gruba buradan kullanıcı atayabilirsiniz.
              </p>
            )}
          </div>
          {selectedNodeId ? (
            <>
              <div className="flex-1 min-h-[280px] overflow-y-auto p-4 bg-gray-50 border-b border-gray-100">
                {groupMembersLoading ? (
                  <p className="text-sm text-gray-500">Grup üyeleri yükleniyor…</p>
                ) : usersLoading ? (
                  <p className="text-sm text-gray-500">Kullanıcı listesi yükleniyor…</p>
                ) : usersError ? (
                  <div className="space-y-2">
                    <p className="text-sm text-amber-700">{usersError}</p>
                    <button
                      type="button"
                      onClick={loadUsers}
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      Kullanıcı listesini yenile
                    </button>
                  </div>
                ) : !users.length ? (
                  <p className="text-sm text-gray-500">
                    Sistemde kullanıcı yok. Önce <strong>Sistem → Kullanıcılar</strong> bölümünden kullanıcı ekleyin, sonra bu sayfayı yenileyin.
                  </p>
                ) : (
                  <>
                    <div className="sticky top-0 -mt-1 pt-1 pb-2 bg-gray-50 z-10">
                      <input
                        type="search"
                        placeholder="Ad, soyad, email veya departman ara…"
                        value={userSearchQuery}
                        onChange={(e) => {
                          setUserSearchQuery(e.target.value);
                          setUserListPage(1);
                        }}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        autoComplete="off"
                      />
                    </div>
                    {(() => {
                      const q = userSearchQuery.trim().toLowerCase();
                      const filtered = q
                        ? users.filter((u) => {
                            const name = [u.firstName, (u as { first_name?: string }).first_name, u.lastName, (u as { last_name?: string }).last_name]
                              .filter(Boolean)
                              .join(' ')
                              .toLowerCase();
                            const email = (u.email ?? '').toLowerCase();
                            const dept = (u.department ?? '').toLowerCase();
                            return name.includes(q) || email.includes(q) || dept.includes(q);
                          })
                        : users;
                      const totalPages = Math.max(1, Math.ceil(filtered.length / USERS_PER_PAGE));
                      const page = Math.min(userListPage, totalPages);
                      const start = (page - 1) * USERS_PER_PAGE;
                      const pageUsers = filtered.slice(start, start + USERS_PER_PAGE);
                      return (
                        <>
                          <p className="text-xs text-gray-500 mb-2 font-medium">
                            {filtered.length === users.length
                              ? `${users.length} kullanıcı`
                              : `${filtered.length} / ${users.length} eşleşen`} — atamak istediklerinizi işaretleyin
                          </p>
                          <ul className="space-y-1.5" role="list">
                            {pageUsers.map((u) => {
                              const uid = typeof u.id === 'number' ? u.id : undefined;
                              const name = [u.firstName, (u as { firstName?: string; first_name?: string }).first_name, u.lastName, (u as { lastName?: string; last_name?: string }).last_name]
                                .filter(Boolean)
                                .join(' ')
                                .trim() || u.email || 'İsimsiz';
                              return (
                                <li key={uid ?? u.email ?? String(Math.random())} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-white">
                                  <input
                                    type="checkbox"
                                    id={`user-${uid ?? u.email}`}
                                    checked={uid != null && selectedUserIds.includes(uid)}
                                    onChange={() => uid != null && toggleUser(uid)}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 shrink-0"
                                    disabled={uid == null}
                                  />
                                  <label htmlFor={`user-${uid ?? u.email}`} className="text-sm text-gray-800 cursor-pointer flex-1">
                                    {name}
                                    {u.department ? <span className="text-gray-500"> · {u.department}</span> : ''}
                                  </label>
                                </li>
                              );
                            })}
                          </ul>
                          {filtered.length === 0 && (
                            <p className="text-sm text-gray-500 py-4 text-center">Arama ile eşleşen kullanıcı yok.</p>
                          )}
                          {filtered.length > 0 && totalPages > 1 && (
                            <div className="sticky bottom-0 flex items-center justify-between gap-2 py-2 mt-2 bg-gray-50 border-t border-gray-100">
                              <button
                                type="button"
                                onClick={() => setUserListPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className="text-sm text-indigo-600 hover:underline disabled:opacity-40 disabled:no-underline"
                              >
                                ← Önceki
                              </button>
                              <span className="text-xs text-gray-500">
                                Sayfa {page} / {totalPages}
                              </span>
                              <button
                                type="button"
                                onClick={() => setUserListPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages}
                                className="text-sm text-indigo-600 hover:underline disabled:opacity-40 disabled:no-underline"
                              >
                                Sonraki →
                              </button>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </>
                )}
              </div>
              <div className="p-4 border-t border-gray-200 shrink-0">
                <button
                  type="button"
                  onClick={loadUsers}
                  className="w-full py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded mb-2"
                >
                  Kullanıcı listesini yenile
                </button>
                <button
                  type="button"
                  onClick={handleSaveMembers}
                  disabled={savingMembers || users.length === 0}
                  className="w-full py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {savingMembers ? 'Kaydediliyor…' : 'Üyeleri kaydet'}
                </button>
                {memberSaveMessage === 'success' && (
                  <p className="text-xs text-emerald-600 mt-2 text-center">Üyeler kaydedildi.</p>
                )}
                {memberSaveMessage === 'error' && (
                  <p className="text-xs text-red-600 mt-2 text-center">Üyeler kaydedilemedi.</p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6 text-center">
              <p className="text-sm text-gray-400">Bir grup seçmek için tahtadaki kutulardan birine tıklayın.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default function UserGroupWhiteboard() {
  return (
    <ReactFlowProvider>
      <UserGroupWhiteboardInner />
    </ReactFlowProvider>
  );
}
