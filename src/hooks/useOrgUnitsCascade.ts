import { useEffect, useState } from "react";
import { getOrgUnits, getOrgUnitDetail } from "../services/orgUnits";

interface OrgUnit {
  id: string;
  displayName: string;
  parent?: { id: string };
}

export function useOrgUnitsCascade() {
  const [levels, setLevels] = useState<Array<Array<OrgUnit>>>([]);
  const [loading, setLoading] = useState(false);

  // 获取所有机构并构建树结构
  useEffect(() => {
    setLoading(true);
    getOrgUnits().then(units => {
      // 找到所有顶级节点（无 parent 的）
      const roots = units.filter((u: OrgUnit) => !u.parent);
      setLevels([roots]);
      setLoading(false);
    });
  }, []);

  // 加载下一级
  const loadChildren = async (parentId: string, level: number) => {
    setLoading(true);
    // 真实应请求API-03获取parent，但此处简化为所有节点的parent匹配
    const allUnits = await getOrgUnits();
    const children = allUnits.filter((u: OrgUnit) => u.parent?.id === parentId);
    setLevels(prev => {
      const copy = prev.slice(0, level + 1);
      if (children.length > 0) copy[level + 1] = children;
      else copy.length = level + 1;
      return copy;
    });
    setLoading(false);
  };

  return { levels, loading, loadChildren };
}