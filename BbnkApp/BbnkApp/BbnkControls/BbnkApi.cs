using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace BbnkApp.BbnkControls
{
    [Route("api/[controller]")]
    [ApiController]
    public class BbnkApi : ControllerBase
    {
        // GET: api/<BbnkApi>
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<BbnkApi>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<BbnkApi>
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }

        // PUT api/<BbnkApi>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<BbnkApi>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
