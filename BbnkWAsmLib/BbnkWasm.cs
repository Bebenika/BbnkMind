using Microsoft.JSInterop;
using System.Runtime.InteropServices.ObjectiveC;

namespace BbnkWAsmLib
{
   
    public class BbnkWasm

    {
        public static BbnkWasm? Instance;


        public BbnkWasm(IJSRuntime runtime)
        {
            jsRuntime = runtime;    
        }
        IJSRuntime? jsRuntime;


       [JSInvokable("FromBrowserInit")]
        public static  void FromBrowserInit(object[] args)
        {
 
            int x = 0;
        }


        public async Task<object> WsamStarted(string options)
        {
            if (jsRuntime == null) return null;
            return await jsRuntime.InvokeAsync<string>("WsamStarted", options);

        }
        public async Task<object?> AddDomToBrowser(string parentDom,string domPropertys)
        {

            if (jsRuntime == null) return null;
            return await jsRuntime.InvokeAsync<string>("AddDomToBrowser",parentDom,domPropertys);

        }
    }
}
