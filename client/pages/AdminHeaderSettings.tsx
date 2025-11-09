import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import { adminSettingsAPI } from "../services/adminApi";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Save, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";

interface SiteSetting {
  id: number;
  key: string;
  value: any;
  type: string;
  group: string;
  description: string;
}

const AdminHeaderSettings = () => {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminSettingsAPI.getSettings('header');
      setSettings(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "فشل في تحميل الإعدادات");
      console.error("Error loading settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => prev.map(setting => 
      setting.key === key 
        ? { ...setting, value }
        : setting
    ));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      // Prepare settings for bulk update
      const settingsToUpdate = settings.map(setting => ({
        key: setting.key,
        value: setting.value
      }));

      await adminSettingsAPI.bulkUpdate(settingsToUpdate);

      Swal.fire({
        icon: 'success',
        title: 'تم بنجاح!',
        text: 'تم حفظ إعدادات Header بنجاح',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });

      // Reload settings to ensure consistency
      await loadSettings();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "فشل في حفظ الإعدادات";
      setError(errorMessage);
      
      Swal.fire({
        icon: 'error',
        title: 'خطأ!',
        text: errorMessage,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const renderSettingInput = (setting: SiteSetting) => {
    switch (setting.type) {
      case 'json':
        return (
          <Textarea
            value={typeof setting.value === 'string' ? setting.value : JSON.stringify(setting.value, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleSettingChange(setting.key, parsed);
              } catch {
                // If invalid JSON, just store as string temporarily
                handleSettingChange(setting.key, e.target.value);
              }
            }}
            rows={8}
            className="font-mono text-sm"
            placeholder="JSON format"
          />
        );
      case 'image':
        return (
          <div className="space-y-2">
            <Input
              type="url"
              value={setting.value || ''}
              onChange={(e) => handleSettingChange(setting.key, e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            {setting.value && (
              <img 
                src={setting.value} 
                alt="Logo preview" 
                className="h-20 w-auto border rounded"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>
        );
      default:
        return (
          <Input
            type="text"
            value={setting.value || ''}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            placeholder={setting.description}
          />
        );
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل الإعدادات...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="px-6 py-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">إعدادات Header</h1>
          <p className="text-gray-600">قم بتعديل محتويات Header التي تظهر في جميع صفحات الموقع</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="space-y-6">
              {settings.map((setting) => (
                <div key={setting.id} className="space-y-2">
                  <Label htmlFor={setting.key} className="text-sm font-medium text-gray-700">
                    {setting.description || setting.key}
                    {setting.type === 'json' && (
                      <span className="text-xs text-gray-500 block mt-1">
                        (JSON Format - استخدم JSON صحيح)
                      </span>
                    )}
                  </Label>
                  {renderSettingInput(setting)}
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={loadSettings}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                إعادة تحميل
              </button>

              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminHeaderSettings;

