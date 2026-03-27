import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Tag, Building2, Package, Layers, Globe, Edit, ArrowLeft } from "lucide-react";
import { DetailActionBar } from "@/components/admin/DetailActionBar";
import { AdminTable, type TableColumn } from "@/components/admin/AdminTable";
import { toast } from "sonner";

const MOCK_BRAND = {
  id: "BRD001",
  name: "马可波罗",
  logo: "🏷️",
  country: "中国",
  ownerType: "own" as const,
  ownerEnterprise: "居然设计家总部",
  info: "马可波罗瓷砖，始创于1996年，是国内建陶行业最早品牌化的企业之一。产品涵盖抛光砖、微晶石、薄板等全品类。",
  categories: ["瓷砖", "卫浴", "五金"],
  series: [
    { id: "s1", name: "真石系列", productCount: 86, status: "active" },
    { id: "s2", name: "岩板大板系列", productCount: 42, status: "active" },
    { id: "s3", name: "1295系列", productCount: 128, status: "active" },
    { id: "s4", name: "国风雅韵系列", productCount: 35, status: "inactive" },
  ],
  enterprises: [
    { id: "e1", name: "居然设计家总部", type: "品牌商", relation: "拥有" },
    { id: "e2", name: "居然之家北四环店", type: "卖场", relation: "代理" },
    { id: "e3", name: "居然之家丽泽店", type: "门店", relation: "代理" },
  ],
  status: "active" as "active" | "inactive",
  productCount: 291,
  createdAt: "2025-03-15",
  updatedAt: "2026-03-20",
};

function InfoItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-[13px] text-muted-foreground w-[90px] shrink-0 text-right">{label}：</span>
      <div className="text-[13px] text-foreground">{children}</div>
    </div>
  );
}

export default function BrandDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const brand = MOCK_BRAND;

  const seriesColumns: TableColumn<typeof brand.series[0]>[] = [
    { key: "id", title: "系列ID", width: 100 },
    { key: "name", title: "系列名称", minWidth: 200 },
    { key: "productCount", title: "商品数", width: 100, align: "center" },
    {
      key: "status", title: "状态", width: 80,
      render: (_, r) => (
        <span className={`inline-flex items-center gap-1 text-[12px] font-medium ${r.status === "active" ? "text-emerald-600" : "text-muted-foreground"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${r.status === "active" ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
          {r.status === "active" ? "启用" : "停用"}
        </span>
      ),
    },
  ];

  const enterpriseColumns: TableColumn<typeof brand.enterprises[0]>[] = [
    { key: "id", title: "企业ID", width: 100 },
    { key: "name", title: "企业名称", minWidth: 200 },
    { key: "type", title: "企业类型", width: 100 },
    {
      key: "relation", title: "品牌关系", width: 100,
      render: (_, r) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${r.relation === "拥有" ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-600"}`}>
          {r.relation}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5 pb-6">
      <DetailActionBar
        backLabel="品牌管理"
        backPath="/brand"
        currentName={brand.name}
        onEdit={() => navigate(`/brand/create?mode=edit&id=${id}`)}
        statusToggle={{
          currentActive: brand.status === "active",
          onToggle: () => toast.success(`品牌已${brand.status === "active" ? "停用" : "启用"}`),
        }}
      />

      {/* Basic Info */}
      <div className="bg-card rounded-2xl border border-border/70 overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
        <div className="px-6 py-4 border-b border-border/60 bg-muted/25 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/8 text-2xl">{brand.logo}</div>
          <div>
            <h2 className="text-[16px] font-semibold text-foreground">{brand.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${brand.ownerType === "own" ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-600"}`}>
                {brand.ownerType === "own" ? "拥有品牌" : "代理品牌"}
              </span>
              <span className={`inline-flex items-center gap-1 text-[12px] font-medium ${brand.status === "active" ? "text-emerald-600" : "text-muted-foreground"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${brand.status === "active" ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                {brand.status === "active" ? "启用" : "停用"}
              </span>
            </div>
          </div>
        </div>
        <div className="p-6 grid grid-cols-2 gap-x-14 gap-y-4">
          <InfoItem label="品牌ID">{brand.id}</InfoItem>
          <InfoItem label="国家"><span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-muted-foreground" />{brand.country}</span></InfoItem>
          <InfoItem label="所属企业">{brand.ownerEnterprise}</InfoItem>
          <InfoItem label="商品总数">{brand.productCount} 个</InfoItem>
          <InfoItem label="创建时间">{brand.createdAt}</InfoItem>
          <InfoItem label="更新时间">{brand.updatedAt}</InfoItem>
          <div className="col-span-2">
            <InfoItem label="品牌简介">{brand.info}</InfoItem>
          </div>
          <div className="col-span-2">
            <InfoItem label="经营品类">
              <div className="flex flex-wrap gap-1.5">
                {brand.categories.map((c) => (
                  <span key={c} className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] bg-muted text-muted-foreground font-medium">{c}</span>
                ))}
              </div>
            </InfoItem>
          </div>
        </div>
      </div>

      {/* Series */}
      <div className="bg-card rounded-2xl border border-border/70 overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
        <div className="px-6 py-4 border-b border-border/60 bg-muted/25 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <h3 className="text-[14px] font-semibold text-foreground">品牌系列</h3>
            <span className="text-[12px] text-muted-foreground">共 {brand.series.length} 个系列</span>
          </div>
        </div>
        <div className="p-0">
          <AdminTable columns={seriesColumns} data={brand.series} rowKey={(r) => r.id} />
        </div>
      </div>

      {/* Associated Enterprises */}
      <div className="bg-card rounded-2xl border border-border/70 overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
        <div className="px-6 py-4 border-b border-border/60 bg-muted/25 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          <h3 className="text-[14px] font-semibold text-foreground">关联企业</h3>
          <span className="text-[12px] text-muted-foreground">共 {brand.enterprises.length} 家企业</span>
        </div>
        <div className="p-0">
          <AdminTable columns={enterpriseColumns} data={brand.enterprises} rowKey={(r) => r.id} />
        </div>
      </div>
    </div>
  );
}
